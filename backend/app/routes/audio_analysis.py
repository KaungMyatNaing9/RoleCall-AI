import asyncio
from fastapi import APIRouter
from app.models.signals import AudioSignals, SessionSummaryRequest
from app.services import audio_signal_service

router = APIRouter()


@router.post("/summarize-session", response_model=AudioSignals)
async def summarize_audio_session(req: SessionSummaryRequest):
    await asyncio.sleep(0.2)
    return audio_signal_service.summarize_transcript(req.transcript, req.duration_s)
