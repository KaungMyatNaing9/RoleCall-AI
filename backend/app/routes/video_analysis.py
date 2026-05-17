import asyncio
from fastapi import APIRouter
from app.models.signals import (
    FrameAnalysisRequest, FrameAnalysisResponse, VideoRuntimeStatus, VideoSignals, SessionSummaryRequest
)
from app.services import audio_signal_service, video_signal_service

router = APIRouter()


@router.get("/status", response_model=VideoRuntimeStatus)
async def video_status():
    return video_signal_service.get_runtime_status()


@router.post("/analyze-frame", response_model=FrameAnalysisResponse)
async def analyze_frame(req: FrameAnalysisRequest):
    return await video_signal_service.analyze_frame(req.session_id, req.frame_b64, req.frame_index)


@router.post("/summarize-session", response_model=VideoSignals)
async def summarize_video_session(req: SessionSummaryRequest):
    await asyncio.sleep(0.1)
    audio = audio_signal_service.summarize_transcript(req.transcript, req.duration_s)
    return video_signal_service.summarize_session(req.session_id, audio)
