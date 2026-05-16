import asyncio
from fastapi import APIRouter
from app.models.signals import (
    FrameAnalysisRequest, FrameAnalysisResponse, VideoSignals, SessionSummaryRequest
)
from app.ml.video.video_pipeline import VideoAnalysisPipeline

router = APIRouter()

# In-memory per-session pipeline registry (lives for the duration of one call)
_sessions: dict[str, VideoAnalysisPipeline] = {}


@router.post("/analyze-frame", response_model=FrameAnalysisResponse)
async def analyze_frame(req: FrameAnalysisRequest):
    if req.session_id not in _sessions:
        _sessions[req.session_id] = VideoAnalysisPipeline(session_id=req.session_id)
    pipeline = _sessions[req.session_id]

    per_frame = await asyncio.get_event_loop().run_in_executor(
        None, pipeline.process_frame, req.frame_b64
    )
    signals = pipeline.get_session_summary()
    return FrameAnalysisResponse(
        signals=signals,
        frame_index=req.frame_index,
        session_id=req.session_id,
    )


@router.post("/summarize-session", response_model=VideoSignals)
async def summarize_video_session(req: SessionSummaryRequest):
    await asyncio.sleep(0.1)
    pipeline = _sessions.pop(req.session_id, None)
    if pipeline is None:
        return VideoSignals()
    return pipeline.get_session_summary()
