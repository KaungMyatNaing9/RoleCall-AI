import asyncio
import json
import re
import uuid
from typing import Any
from urllib import error, request

from app.config import settings
from app.models.persona import PersonaResponse
from app.prompts.persona_prompt import (
    PERSONA_AGENT_SYSTEM_PROMPT,
    build_persona_agent_prompt,
)
from app.prompts.scenario_prompt import (
    SCENARIO_AGENT_SYSTEM_PROMPT,
    build_scenario_agent_prompt,
)
from app.services import mock_service


PERSONA_STORE: dict[str, PersonaResponse] = {}
SCENARIO_STORE: dict[str, dict[str, Any]] = {}
RUBRIC_STORE: dict[str, Any] = {}

def _normalize_sliders(behavior_sliders: dict[str, float] | None) -> dict[str, float]:
    sliders = behavior_sliders or {}
    defaults = {
        "emotional_intensity": 0.4,
        "interruptions": 0.25,
        "hidden_agenda": 0.6,
        "patience": 0.7,
        "escalation_risk": 0.55,
    }
    normalized: dict[str, float] = {}
    for key, fallback in defaults.items():
        try:
            normalized[key] = max(0.0, min(1.0, float(sliders.get(key, fallback))))
        except (TypeError, ValueError):
            normalized[key] = fallback
    return normalized


def _format_behavior_controls(behavior_sliders: dict[str, float], behavior_toggles: dict[str, bool] | None) -> str:
    toggles = behavior_toggles or {}
    slider_labels = {
        "emotional_intensity": "Emotional intensity",
        "interruptions": "Interruptions",
        "hidden_agenda": "Hidden agenda",
        "patience": "Patience level",
        "escalation_risk": "Escalation risk",
    }
    lines = [f"- {slider_labels[key]}: {round(value * 100)} / 100" for key, value in behavior_sliders.items()]
    for key, value in sorted(toggles.items()):
        lines.append(f"- {key.replace('_', ' ').title()}: {'enabled' if value else 'disabled'}")
    return "\n".join(lines)


def _apply_persona_controls(
    persona: PersonaResponse,
    behavior_sliders: dict[str, float],
    behavior_toggles: dict[str, bool] | None,
) -> PersonaResponse:
    toggles = behavior_toggles or {}
    emotional_intensity = behavior_sliders["emotional_intensity"]
    interruptions = behavior_sliders["interruptions"]
    hidden_agenda = behavior_sliders["hidden_agenda"]
    patience = behavior_sliders["patience"]
    escalation_risk = behavior_sliders["escalation_risk"]

    mood = persona.mood
    if emotional_intensity >= 0.78 and mood == "neutral":
        mood = "upset"
    elif emotional_intensity >= 0.65 and mood == "neutral":
        mood = "anxious"

    behavior_parts = [persona.behavior.rstrip(".")]
    if interruptions >= 0.65:
        behavior_parts.append("tends to interrupt or jump back to the main concern")
    elif interruptions <= 0.2:
        behavior_parts.append("waits for the trainee to finish before responding")
    if patience <= 0.35:
        behavior_parts.append("loses patience quickly if the trainee sounds vague")
    elif patience >= 0.82:
        behavior_parts.append("stays patient if the trainee explains clearly")
    if hidden_agenda >= 0.65:
        behavior_parts.append("holds back a key concern until trust is established")
    if escalation_risk >= 0.7:
        behavior_parts.append("carries a higher-risk issue that should shift the conversation into escalation or safety planning")
    if toggles.get("random_surprise", False):
        behavior_parts.append("may add one unexpected detail that tests composure")

    hidden_red_flag = persona.hidden_red_flag
    if not toggles.get("hidden_red_flag", True):
        hidden_red_flag = None
    elif escalation_risk >= 0.75 and not hidden_red_flag:
        hidden_red_flag = "Reveals a safety-sensitive concern only after the trainee asks a focused follow-up."

    voice_style = persona.voice_style.rstrip(".")
    if toggles.get("light_accent", False):
        voice_style = f"{voice_style}; slight regional accent"
    if emotional_intensity >= 0.72:
        voice_style = f"{voice_style}; more emotionally charged delivery"
    elif patience >= 0.82:
        voice_style = f"{voice_style}; steady and measured pacing"

    sample_lines = persona.sample_lines[:]
    if interruptions >= 0.65 and sample_lines:
        sample_lines[0] = f"{sample_lines[0].rstrip('.')} and I need to understand this now."

    return persona.model_copy(
        update={
            "mood": mood,
            "behavior": ". ".join(dict.fromkeys(behavior_parts)).strip(".") + ".",
            "hidden_red_flag": hidden_red_flag,
            "voice_style": voice_style + ".",
            "sample_lines": sample_lines,
        }
    )


def _apply_scenario_controls(
    payload: dict[str, Any],
    persona: PersonaResponse | None,
    behavior_sliders: dict[str, float],
    behavior_toggles: dict[str, bool] | None,
) -> dict[str, Any]:
    toggles = behavior_toggles or {}
    escalation_risk = behavior_sliders["escalation_risk"]
    hidden_agenda = behavior_sliders["hidden_agenda"]
    interruptions = behavior_sliders["interruptions"]
    patience = behavior_sliders["patience"]

    description_parts = [str(payload["description"]).rstrip(".")]
    objective_parts = [str(payload["objective"]).rstrip(".")]
    success_parts = [str(payload["success_condition"]).rstrip(".")]

    if hidden_agenda >= 0.65:
        description_parts.append("A key concern is intentionally held back until the trainee builds trust or asks more precisely")
    if interruptions >= 0.6:
        description_parts.append("The conversation includes frequent redirections or interruptions from the persona")
    if patience <= 0.35:
        description_parts.append("The trainee must regain control quickly before the conversation deteriorates")
    if toggles.get("random_surprise", False):
        description_parts.append("An unexpected detail may surface mid-conversation and force the trainee to adapt")
    if escalation_risk >= 0.7:
        objective_parts.append("Recognize the higher-risk cue early and shift into escalation or urgent next-step planning")
        success_parts.append("The trainee identifies the risk cue and responds with a safe escalation path")
    if not toggles.get("hidden_red_flag", True):
        success_parts.append("The trainee still closes with a clear summary and next step even without a hidden red flag reveal")
    if persona and persona.hidden_red_flag:
        success_parts.append(f"The trainee responds appropriately if {persona.name} reveals: {persona.hidden_red_flag}")

    payload["description"] = ". ".join(dict.fromkeys(description_parts)).strip(".") + "."
    payload["objective"] = ". ".join(dict.fromkeys(objective_parts)).strip(".") + "."
    payload["success_condition"] = ". ".join(dict.fromkeys(success_parts)).strip(".") + "."
    return payload


def _strip_json_block(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()
    return cleaned


def _post_json(url: str, headers: dict[str, str], payload: dict[str, Any], timeout: float = 45.0) -> dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=body, headers=headers, method="POST")
    with request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _avatar_preset_for_persona(role: str, mood: str, age: int, name: str) -> str:
    role_l = role.lower()
    mood_l = mood.lower()
    name_l = name.lower()
    if age >= 60:
        return "margaret"
    if "interview" in role_l or "recruit" in role_l:
        return "james"
    if "teacher" in role_l or "parent" in role_l or "customer" in role_l:
        return "elena"
    if "finance" in role_l or "client" in role_l:
        return "david"
    if any(token in name_l for token in ("aanya", "priya", "anika", "maya")):
        return "aanya"
    if "angry" in mood_l:
        return "james"
    return "elena"


def _normalize_gender(value: str | None, name: str, voice_style: str) -> str:
    normalized = (value or "").strip().lower()
    if normalized in {"female", "male", "nonbinary", "unspecified"}:
        return normalized

    fallback = f"{name} {voice_style}".lower()
    female_hints = (" she ", " her ", " woman", " female", " mother", " grandmother", " mrs", " ms", " girl")
    male_hints = (" he ", " his ", " man", " male", " father", " grandfather", " mr", " boy")
    padded = f" {fallback} "
    if any(hint in padded for hint in female_hints):
        return "female"
    if any(hint in padded for hint in male_hints):
        return "male"
    return "unspecified"


def _coerce_persona(payload: dict[str, Any], industry: str) -> PersonaResponse:
    name = str(payload.get("name") or "Generated Persona").strip()
    age = int(payload.get("age") or 35)
    role = str(payload.get("role") or f"{industry} caller").strip()
    mood = str(payload.get("mood") or "neutral").strip().lower()
    traits = [str(item).strip() for item in payload.get("traits", []) if str(item).strip()][:3] or ["calm", "direct", "guarded"]
    goal = str(payload.get("goal") or "Resolve the issue").strip()
    hidden_red_flag = payload.get("hidden_red_flag")
    behavior = str(payload.get("behavior") or "Answers naturally and asks follow-up questions.").strip()
    voice_style = str(payload.get("voice_style") or "Natural, conversational, clear pacing.").strip()
    opening_line = str(payload.get("opening_line") or "Hi, I need some help with this situation.").strip()
    sample_lines = [str(item).strip() for item in payload.get("sample_lines", []) if str(item).strip()]
    if not sample_lines:
        sample_lines = [opening_line]
    if opening_line not in sample_lines:
        sample_lines.insert(0, opening_line)
    sample_lines = sample_lines[:8]

    return PersonaResponse(
        id=f"persona-{uuid.uuid4().hex[:10]}",
        name=name,
        age=age,
        gender=_normalize_gender(payload.get("gender"), name, voice_style),
        role=role,
        mood=mood,
        traits=traits,
        goal=goal,
        hidden_red_flag=str(hidden_red_flag).strip() if hidden_red_flag else None,
        behavior=behavior,
        voice_style=voice_style,
        opening_line=opening_line,
        avatar_preset=_avatar_preset_for_persona(role, mood, age, name),
        sample_lines=sample_lines,
    )


def _default_role_for_industry(industry: str) -> str:
    defaults = {
        "healthcare": "Healthcare provider handling a follow-up call",
        "customer service": "Support representative handling a live issue",
        "sales": "Sales rep guiding a discovery conversation",
        "hr/interviews": "Interviewer running a structured practice session",
        "education": "Advisor handling a student or parent conversation",
        "finance": "Client support specialist responding to a concern",
        "hospitality": "Front-desk or guest support lead handling a complaint",
    }
    return defaults.get(industry.lower(), f"{industry} professional managing the conversation")


def _coerce_scenario(
    payload: dict[str, Any],
    industry: str,
    difficulty: str,
    mode: str,
    persona: PersonaResponse | None,
) -> dict[str, Any]:
    persona_name = persona.name if persona else "the caller"
    persona_role = persona.role if persona else f"{industry} participant"
    title = str(payload.get("title") or f"{persona_name} {industry} practice scenario").strip()
    description = str(
        payload.get("description")
        or f"{persona_name}, a {persona_role.lower()}, needs help with a realistic {industry.lower()} situation. "
           f"The trainee should clarify the issue, guide the conversation, and manage any hidden risk cues."
    ).strip()
    your_role = str(payload.get("your_role") or _default_role_for_industry(industry)).strip()
    duration = str(payload.get("duration") or ("~6 min" if mode == "text" else "~5 min")).strip()
    objective = str(
        payload.get("objective")
        or f"Understand {persona_name}'s concern, respond clearly, and move toward a safe, useful next step."
    ).strip()
    success_condition = str(
        payload.get("success_condition")
        or f"The trainee addresses {persona_name}'s main concern, responds to any red flags, and closes with a clear next step."
    ).strip()

    return {
        "id": str(payload.get("id") or f"scenario-{uuid.uuid4().hex[:10]}"),
        "title": title[:140],
        "description": description[:360],
        "your_role": your_role[:120],
        "duration": duration[:40],
        "objective": objective[:260],
        "success_condition": success_condition[:260],
        "difficulty": str(payload.get("difficulty") or difficulty).strip() or difficulty,
        "industry": str(payload.get("industry") or industry).strip() or industry,
    }


def _openai_json_sync(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    payload = _post_json(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        payload={
            "model": settings.openai_model,
            "temperature": 0.8,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        },
    )
    content = payload["choices"][0]["message"]["content"]
    return json.loads(_strip_json_block(content))


def _anthropic_json_sync(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    payload = _post_json(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": settings.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        payload={
            "model": settings.anthropic_model,
            "max_tokens": 1200,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        },
    )
    text_blocks = [block.get("text", "") for block in payload.get("content", []) if block.get("type") == "text"]
    return json.loads(_strip_json_block("\n".join(text_blocks)))


async def _openai_json(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    return await asyncio.to_thread(_openai_json_sync, system_prompt, user_prompt)


async def _anthropic_json(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    return await asyncio.to_thread(_anthropic_json_sync, system_prompt, user_prompt)


async def generate_persona(
    prompt: str,
    industry: str,
    difficulty: str,
    behavior_sliders: dict[str, float] | None = None,
    behavior_toggles: dict[str, bool] | None = None,
) -> PersonaResponse:
    normalized_sliders = _normalize_sliders(behavior_sliders)
    user_prompt = build_persona_agent_prompt(
        prompt=prompt,
        industry=industry,
        difficulty=difficulty,
        behavior_controls=_format_behavior_controls(normalized_sliders, behavior_toggles),
    )

    try:
        if settings.openai_api_key:
            persona = _coerce_persona(await _openai_json(PERSONA_AGENT_SYSTEM_PROMPT, user_prompt), industry)
        elif settings.anthropic_api_key:
            persona = _coerce_persona(await _anthropic_json(PERSONA_AGENT_SYSTEM_PROMPT, user_prompt), industry)
        else:
            persona = mock_service.get_persona(prompt, industry)
    except Exception:
        persona = mock_service.get_persona(prompt, industry)

    persona = _apply_persona_controls(persona, normalized_sliders, behavior_toggles)
    PERSONA_STORE[persona.id] = persona
    return persona


async def generate_scenario(
    persona_id: str,
    industry: str,
    difficulty: str,
    mode: str,
    behavior_sliders: dict[str, float] | None = None,
    behavior_toggles: dict[str, bool] | None = None,
) -> dict[str, Any]:
    normalized_sliders = _normalize_sliders(behavior_sliders)
    persona = PERSONA_STORE.get(persona_id)
    if not persona:
        scenario = mock_service.get_scenario(persona_id, industry)
        payload = _coerce_scenario(scenario.model_dump(), industry, difficulty, mode, None)
        payload = _apply_scenario_controls(payload, None, normalized_sliders, behavior_toggles)
        SCENARIO_STORE[payload["id"]] = payload
        return payload

    user_prompt = build_scenario_agent_prompt(
        persona=persona,
        industry=industry,
        difficulty=difficulty,
        mode=mode,
        behavior_controls=_format_behavior_controls(normalized_sliders, behavior_toggles),
    )

    try:
        if settings.openai_api_key:
            payload = _coerce_scenario(await _openai_json(SCENARIO_AGENT_SYSTEM_PROMPT, user_prompt), industry, difficulty, mode, persona)
        elif settings.anthropic_api_key:
            payload = _coerce_scenario(await _anthropic_json(SCENARIO_AGENT_SYSTEM_PROMPT, user_prompt), industry, difficulty, mode, persona)
        else:
            payload = _coerce_scenario(mock_service.get_scenario(persona_id, industry).model_dump(), industry, difficulty, mode, persona)
    except Exception:
        payload = _coerce_scenario(mock_service.get_scenario(persona_id, industry).model_dump(), industry, difficulty, mode, persona)

    payload = _apply_scenario_controls(payload, persona, normalized_sliders, behavior_toggles)
    SCENARIO_STORE[payload["id"]] = payload
    return payload


def get_persona(persona_id: str) -> PersonaResponse | None:
    return PERSONA_STORE.get(persona_id)
