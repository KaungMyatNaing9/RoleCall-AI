import asyncio
from fastapi import APIRouter
from app.models.signals import AudioSignals, SessionSummaryRequest
from app.ml.audio.filler_words import count_filler_words
from app.ml.audio.speaking_pace import compute_wpm
from app.services import mock_service

router = APIRouter()


@router.post("/summarize-session", response_model=AudioSignals)
async def summarize_audio_session(req: SessionSummaryRequest):
    await asyncio.sleep(0.2)
    summary = mock_service.get_mock_audio_summary()
    if req.transcript:
        summary.filler_word_count = count_filler_words(req.transcript)
        summary.speaking_pace_wpm = compute_wpm(req.transcript, req.duration_s)
    return summary
