import asyncio
import json
from urllib import error, request

from fastapi import HTTPException

from app.config import settings
from app.services import persona_service


_VOICE_CACHE: list[dict] | None = None


def _get_json(url: str, headers: dict[str, str], timeout: float = 30.0) -> dict:
    req = request.Request(url, headers=headers, method="GET")
    with request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _post_audio(url: str, headers: dict[str, str], payload: dict, timeout: float = 60.0) -> bytes:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=body, headers=headers, method="POST")
    with request.urlopen(req, timeout=timeout) as response:
        return response.read()


def _normalize_gender(value: str | None) -> str:
    normalized = (value or "").strip().lower()
    if normalized in {"female", "male", "nonbinary", "unspecified"}:
        return normalized
    return "unspecified"


def _age_band(age: int | None) -> str:
    if age is None:
        return "adult"
    if age < 25:
        return "young"
    if age >= 60:
        return "senior"
    return "adult"


def _voice_override_for_demographic(gender: str, age_band: str) -> str:
    lookup = {
        ("female", "young"): settings.elevenlabs_voice_female_young,
        ("female", "adult"): settings.elevenlabs_voice_female_adult,
        ("female", "senior"): settings.elevenlabs_voice_female_senior,
        ("male", "young"): settings.elevenlabs_voice_male_young,
        ("male", "adult"): settings.elevenlabs_voice_male_adult,
        ("male", "senior"): settings.elevenlabs_voice_male_senior,
        ("nonbinary", "young"): settings.elevenlabs_voice_neutral_young,
        ("nonbinary", "adult"): settings.elevenlabs_voice_neutral_adult,
        ("nonbinary", "senior"): settings.elevenlabs_voice_neutral_senior,
        ("unspecified", "young"): settings.elevenlabs_voice_neutral_young,
        ("unspecified", "adult"): settings.elevenlabs_voice_neutral_adult,
        ("unspecified", "senior"): settings.elevenlabs_voice_neutral_senior,
    }
    return lookup.get((gender, age_band), "").strip()


def _fetch_voices_sync() -> list[dict]:
    global _VOICE_CACHE
    if _VOICE_CACHE is not None:
        return _VOICE_CACHE
    payload = _get_json(
        "https://api.elevenlabs.io/v1/voices",
        headers={"xi-api-key": settings.elevenlabs_api_key},
    )
    _VOICE_CACHE = payload.get("voices", [])
    return _VOICE_CACHE


def _find_persona(persona_id: str | None, persona_name: str | None):
    if persona_id:
        return persona_service.get_persona(persona_id)
    if persona_name:
        for persona in persona_service.PERSONA_STORE.values():
            if persona.name.strip().lower() == persona_name.strip().lower():
                return persona
    return None


def _resolve_voice_id_sync(persona_id: str | None = None, persona_name: str | None = None) -> str:
    persona = _find_persona(persona_id, persona_name)
    if persona:
        demographic_voice = _voice_override_for_demographic(_normalize_gender(persona.gender), _age_band(persona.age))
        if demographic_voice:
            return demographic_voice

    if settings.elevenlabs_voice_id:
        return settings.elevenlabs_voice_id

    voices = _fetch_voices_sync()
    if not voices:
        raise HTTPException(status_code=502, detail="ElevenLabs returned no available voices.")

    if persona:
        target_gender = _normalize_gender(persona.gender)
        target_age = _age_band(persona.age)
        scored: list[tuple[int, str]] = []
        for voice in voices:
            labels = voice.get("labels", {}) or {}
            search_blob = " ".join(
                str(part).lower()
                for part in [
                    voice.get("name", ""),
                    labels.get("gender", ""),
                    labels.get("age", ""),
                    labels.get("accent", ""),
                    labels.get("description", ""),
                ]
            )
            score = 0
            if target_gender != "unspecified" and target_gender in search_blob:
                score += 5
            if target_age == "young" and any(token in search_blob for token in ("young", "teen", "20", "college")):
                score += 3
            if target_age == "adult" and any(token in search_blob for token in ("adult", "30", "40", "professional")):
                score += 3
            if target_age == "senior" and any(token in search_blob for token in ("old", "older", "senior", "elder", "60", "70")):
                score += 3
            if score:
                scored.append((score, voice["voice_id"]))
        if scored:
            scored.sort(reverse=True)
            return scored[0][1]

    return voices[0]["voice_id"]


def _synthesize_speech_sync(
    text: str,
    voice_id: str | None = None,
    persona_id: str | None = None,
    persona_name: str | None = None,
) -> bytes:
    resolved_voice_id = voice_id or _resolve_voice_id_sync(persona_id, persona_name)
    return _post_audio(
        f"https://api.elevenlabs.io/v1/text-to-speech/{resolved_voice_id}",
        headers={
            "xi-api-key": settings.elevenlabs_api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        payload={
            "text": text,
            "model_id": settings.elevenlabs_model_id,
            "voice_settings": {
                "stability": 0.45,
                "similarity_boost": 0.75,
                "style": 0.35,
                "use_speaker_boost": True,
            },
            "pronunciation_dictionary_locators": [],
        },
    )


async def synthesize_speech(
    text: str,
    voice_style: str | None = None,
    voice_id: str | None = None,
    persona_id: str | None = None,
    persona_name: str | None = None,
) -> bytes:
    if not settings.elevenlabs_api_key:
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY is not configured.")

    try:
        return await asyncio.to_thread(_synthesize_speech_sync, text, voice_id, persona_id, persona_name)
    except HTTPException:
        raise
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail=f"ElevenLabs synthesis failed: {detail}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"ElevenLabs synthesis failed: {exc}") from exc
