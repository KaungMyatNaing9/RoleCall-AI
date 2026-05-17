import asyncio
import json
from urllib import error, request

from fastapi import HTTPException

from app.config import settings
from app.models.simulation import CreateAgentRequest


def _post_json(url: str, headers: dict[str, str], payload: dict, timeout: float = 45.0) -> dict:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=body, headers=headers, method="POST")
    with request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _get_json(url: str, headers: dict[str, str], timeout: float = 30.0) -> dict:
    req = request.Request(url, headers=headers, method="GET")
    with request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _build_system_prompt(req: CreateAgentRequest) -> str:
    p = req.persona
    s = req.scenario
    rubric_criteria = ", ".join(item.name for item in req.rubric.items)

    lines = [
        f"You are {p.name}, {p.age} years old, {p.role}.",
        f"Current mood: {p.mood}.",
        f"Personality traits: {', '.join(p.traits)}.",
        f"Your goal in this call: {p.goal}.",
        f"How you behave: {p.behavior}.",
        f"Voice style: {p.voice_style}.",
        "",
        f"Scenario: {s.title}",
        f"{s.description}",
        f"The trainee's role: {s.your_role}.",
        f"Objective: {s.objective}.",
        f"Success condition: {s.success_condition}.",
        "",
        "Evaluation criteria the trainee is being scored on: " + rubric_criteria + ".",
        "",
        "Rules:",
        "- Stay fully in character at all times. Do not break character.",
        "- Start the conversation with your opening line when greeted.",
        "- Reveal your hidden concern gradually unless asked directly.",
        "- React realistically to empathy, poor communication, or escalation.",
        "- Do not mention you are an AI or that this is a simulation.",
    ]

    if p.hidden_red_flag:
        lines.append(f"- Hidden concern (reveal only when appropriate): {p.hidden_red_flag}.")

    lines.append(f"Opening line: \"{p.opening_line}\"")
    return "\n".join(lines)


def _resolve_voice_id_for_persona(req: CreateAgentRequest) -> str:
    from app.services.voice_service import _resolve_voice_id_sync
    return _resolve_voice_id_sync(persona_id=req.persona.id, persona_name=req.persona.name)


def _create_agent_sync(req: CreateAgentRequest) -> str:
    if not settings.elevenlabs_api_key:
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY is not configured.")

    system_prompt = _build_system_prompt(req)

    try:
        voice_id = _resolve_voice_id_for_persona(req)
    except Exception:
        voice_id = settings.elevenlabs_voice_id or ""

    payload: dict = {
        "name": f"RoleCall-{req.persona.id}",
        "conversation_config": {
            "agent": {
                "prompt": {
                    "prompt": system_prompt,
                    "llm": "gpt-4o-mini",
                    "temperature": 0.8,
                    "max_tokens": 300,
                },
                "first_message": req.persona.opening_line,
                "language": "en",
            },
            "tts": {
                "model_id": settings.elevenlabs_model_id or "eleven_multilingual_v2",
                "voice_id": voice_id,
                "stability": 0.45,
                "similarity_boost": 0.75,
            },
        },
    }

    try:
        result = _post_json(
            "https://api.elevenlabs.io/v1/convai/agents/create",
            headers={
                "xi-api-key": settings.elevenlabs_api_key,
                "Content-Type": "application/json",
            },
            payload=payload,
        )
        agent_id = result.get("agent_id") or result.get("id")
        if not agent_id:
            raise HTTPException(status_code=502, detail="ElevenLabs did not return an agent_id.")
        return str(agent_id)
    except HTTPException:
        raise
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail=f"ElevenLabs agent creation failed: {detail}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"ElevenLabs agent creation failed: {exc}") from exc


def _get_signed_url_sync(agent_id: str) -> str:
    if not settings.elevenlabs_api_key:
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY is not configured.")

    try:
        result = _get_json(
            f"https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id={agent_id}",
            headers={"xi-api-key": settings.elevenlabs_api_key},
        )
        signed_url = result.get("signed_url")
        if not signed_url:
            raise HTTPException(status_code=502, detail="ElevenLabs did not return a signed_url.")
        return str(signed_url)
    except HTTPException:
        raise
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail=f"ElevenLabs signed URL failed: {detail}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"ElevenLabs signed URL failed: {exc}") from exc


async def create_agent(req: CreateAgentRequest) -> str:
    return await asyncio.to_thread(_create_agent_sync, req)


async def get_signed_url(agent_id: str) -> str:
    return await asyncio.to_thread(_get_signed_url_sync, agent_id)
