from fastapi import APIRouter, Response

from app.models.voice import VoiceSynthesisRequest
from app.services import voice_service

router = APIRouter()


@router.post("/synthesize")
async def synthesize_voice(req: VoiceSynthesisRequest):
    audio = await voice_service.synthesize_speech(
        text=req.text,
        voice_style=req.voice_style,
        voice_id=req.voice_id,
        persona_id=req.persona_id,
        persona_name=req.persona_name,
    )
    return Response(content=audio, media_type="audio/mpeg")
