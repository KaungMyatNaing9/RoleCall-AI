import asyncio
import json
from urllib import error, request

from fastapi import HTTPException

from app.config import settings


def _get_json(url: str, headers: dict[str, str], timeout: float = 30.0) -> dict:
    req = request.Request(url, headers=headers, method="GET")
    with request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def _post_audio(url: str, headers: dict[str, str], payload: dict, timeout: float = 60.0) -> bytes:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=body, headers=headers, method="POST")
    with request.urlopen(req, timeout=timeout) as response:
        return response.read()


def _resolve_voice_id_sync() -> str:
    if settings.elevenlabs_voice_id:
        return settings.elevenlabs_voice_id

    payload = _get_json(
        "https://api.elevenlabs.io/v1/voices",
        headers={"xi-api-key": settings.elevenlabs_api_key},
    )
    voices = payload.get("voices", [])
    if not voices:
        raise HTTPException(status_code=502, detail="ElevenLabs returned no available voices.")
    return voices[0]["voice_id"]


def _synthesize_speech_sync(text: str, voice_id: str | None = None) -> bytes:
    resolved_voice_id = voice_id or _resolve_voice_id_sync()
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


async def synthesize_speech(text: str, voice_style: str | None = None, voice_id: str | None = None) -> bytes:
    if not settings.elevenlabs_api_key:
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY is not configured.")

    try:
        return await asyncio.to_thread(_synthesize_speech_sync, text, voice_id)
    except HTTPException:
        raise
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(status_code=502, detail=f"ElevenLabs synthesis failed: {detail}") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"ElevenLabs synthesis failed: {exc}") from exc
