import asyncio
from fastapi import APIRouter
from app.models.signals import (
    FrameAnalysisRequest, FrameAnalysisResponse, VideoSignals, SessionSummaryRequest
)
from app.services import mock_service

router = APIRouter()


@router.post("/analyze-frame", response_model=FrameAnalysisResponse)
async def analyze_frame(req: FrameAnalysisRequest):
    return mock_service.get_mock_frame_signals(req.session_id, req.frame_index)


@router.post("/summarize-session", response_model=VideoSignals)
async def summarize_video_session(req: SessionSummaryRequest):
    await asyncio.sleep(0.2)
    return mock_service.get_mock_video_summary()
