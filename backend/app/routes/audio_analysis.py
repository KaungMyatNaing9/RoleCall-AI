import asyncio
from fastapi import APIRouter
from app.models.signals import AudioSignals, SessionSummaryRequest
from app.services import mock_service

router = APIRouter()


@router.post("/summarize-session", response_model=AudioSignals)
async def summarize_audio_session(req: SessionSummaryRequest):
    await asyncio.sleep(0.2)
    return mock_service.get_mock_audio_summary()
