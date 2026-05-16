import asyncio
import json
import re
import uuid
from typing import Any
from urllib import error, request

from app.config import settings
from app.models.persona import PersonaResponse
from app.services import mock_service


PERSONA_STORE: dict[str, PersonaResponse] = {}
SCENARIO_STORE: dict[str, dict[str, Any]] = {}

OPENAI_PERSONA_SYSTEM = """You generate realistic training personas for RoleCall AI.
Return JSON only with keys:
name, age, role, mood, traits, goal, hidden_red_flag, behavior, voice_style, opening_line, sample_lines.

Rules:
- Make the persona specific and believable.
- Fit the requested industry and difficulty.
- `traits` must be an array of 3 short strings.
- `sample_lines` must be an array of 6 to 8 lines in the persona's voice.
- If a safety-sensitive red flag exists, phrase it as something the persona says or reveals later.
- Avoid unsupported claims about emotion detection, truthfulness, or mental state.
"""

OPENAI_SCENARIO_SYSTEM = """You generate structured conversation-practice scenarios for RoleCall AI.
Return JSON only with keys:
title, description, your_role, duration, objective, success_condition, difficulty, industry.

Rules:
- Keep description to 2 sentences max.
- Match the provided persona and training context.
- Make success_condition concrete and observable.
"""


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


async def generate_persona(prompt: str, industry: str, difficulty: str) -> PersonaResponse:
    user_prompt = (
        f"Industry: {industry}\n"
        f"Difficulty: {difficulty}\n"
        f"Prompt: {prompt}\n\n"
        "Create a realistic simulation persona for a browser voice or video roleplay."
    )

    try:
        if settings.openai_api_key:
            persona = _coerce_persona(await _openai_json(OPENAI_PERSONA_SYSTEM, user_prompt), industry)
        elif settings.anthropic_api_key:
            persona = _coerce_persona(await _anthropic_json(OPENAI_PERSONA_SYSTEM, user_prompt), industry)
        else:
            persona = mock_service.get_persona(prompt, industry)
    except Exception:
        persona = mock_service.get_persona(prompt, industry)

    PERSONA_STORE[persona.id] = persona
    return persona


async def generate_scenario(persona_id: str, industry: str, difficulty: str, mode: str) -> dict[str, Any]:
    persona = PERSONA_STORE.get(persona_id)
    if not persona:
        scenario = mock_service.get_scenario(persona_id, industry)
        payload = scenario.model_dump()
        SCENARIO_STORE[payload["id"]] = payload
        return payload

    user_prompt = (
        f"Industry: {industry}\n"
        f"Difficulty: {difficulty}\n"
        f"Mode: {mode}\n"
        f"Persona name: {persona.name}\n"
        f"Persona role: {persona.role}\n"
        f"Persona goal: {persona.goal}\n"
        f"Persona behavior: {persona.behavior}\n"
        f"Hidden red flag: {persona.hidden_red_flag or 'none'}\n"
        f"Opening line: {persona.opening_line}\n"
    )

    try:
        if settings.openai_api_key:
            payload = await _openai_json(OPENAI_SCENARIO_SYSTEM, user_prompt)
        elif settings.anthropic_api_key:
            payload = await _anthropic_json(OPENAI_SCENARIO_SYSTEM, user_prompt)
        else:
            payload = mock_service.get_scenario(persona_id, industry).model_dump()
    except Exception:
        payload = mock_service.get_scenario(persona_id, industry).model_dump()

    payload["id"] = payload.get("id") or f"scenario-{uuid.uuid4().hex[:10]}"
    payload["difficulty"] = str(payload.get("difficulty") or difficulty)
    payload["industry"] = str(payload.get("industry") or industry)
    SCENARIO_STORE[payload["id"]] = payload
    return payload


def get_persona(persona_id: str) -> PersonaResponse | None:
    return PERSONA_STORE.get(persona_id)
