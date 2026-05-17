from __future__ import annotations

import asyncio

from app.ml.video import frame_decoder, video_pipeline
from app.ml.video.video_pipeline import VideoAnalysisPipeline
from app.models.signals import AudioSignals, FrameAnalysisResponse, VideoRuntimeStatus, VideoSignals


_sessions: dict[str, VideoAnalysisPipeline] = {}
_latest_signals: dict[str, VideoSignals] = {}


def _decorate(signals: VideoSignals, audio_signals: AudioSignals | None = None, source: str = "video_signal_service") -> VideoSignals:
    if audio_signals is None:
        return signals.model_copy(update={"analysis_source": source})
    confidence = signals.confidence if hasattr(signals, "confidence") else 0.0
    if source == "ml_video_pipeline":
        confidence = max(confidence, 0.65)
    return signals.model_copy(
        update={
            "speaking_pace_wpm": audio_signals.speaking_pace_wpm,
            "interruption_count": audio_signals.interruption_count,
            "filler_word_count": audio_signals.filler_word_count,
            "analysis_source": source,
            "confidence": confidence,
        }
    )


async def analyze_frame(session_id: str, frame_b64: str, frame_index: int) -> FrameAnalysisResponse:
    if session_id not in _sessions:
        _sessions[session_id] = VideoAnalysisPipeline(session_id=session_id)
    pipeline = _sessions[session_id]

    await asyncio.get_event_loop().run_in_executor(None, pipeline.process_frame, frame_b64)
    signals = _decorate(pipeline.get_session_summary(), source="ml_video_pipeline")
    _latest_signals[session_id] = signals
    return FrameAnalysisResponse(signals=signals, frame_index=frame_index, session_id=session_id)


def get_live_summary(session_id: str, mode: str, audio_signals: AudioSignals | None = None) -> VideoSignals | None:
    if mode != "video":
        return None

    signals = _latest_signals.get(session_id)
    if signals is not None:
        return _decorate(signals, audio_signals, source=signals.analysis_source or "ml_video_pipeline")

    if audio_signals is None:
        return VideoSignals(confidence=0.0, analysis_source="video_unavailable")

    heuristic = VideoSignals(
        eye_contact_estimate=0.54 if audio_signals.speaking_pace_wpm > 170 else 0.68,
        face_centered=audio_signals.interruption_count < 4,
        head_movement_stability=max(0.42, min(0.91, 0.86 - audio_signals.filler_word_count * 0.012)),
        facial_engagement_estimate=max(0.45, min(0.9, 0.62 + max(0, 160 - audio_signals.speaking_pace_wpm) / 500)),
        speaking_pace_wpm=audio_signals.speaking_pace_wpm,
        interruption_count=audio_signals.interruption_count,
        filler_word_count=audio_signals.filler_word_count,
        analysis_source="video_heuristic_fallback",
        confidence=0.18,
    )
    return heuristic


def summarize_session(session_id: str, audio_signals: AudioSignals | None = None) -> VideoSignals:
    pipeline = _sessions.pop(session_id, None)
    if pipeline is None:
        existing = _latest_signals.pop(session_id, None)
        if existing is not None:
            return _decorate(existing, audio_signals, source=existing.analysis_source or "ml_video_pipeline")
        return _decorate(VideoSignals(confidence=0.0, analysis_source="video_unavailable"), audio_signals, source="video_unavailable")

    signals = _decorate(pipeline.get_session_summary(), audio_signals, source="ml_video_pipeline")
    _latest_signals[session_id] = signals
    return signals


def get_runtime_status() -> VideoRuntimeStatus:
    pipeline_status = video_pipeline.runtime_status()
    live_ready = bool(pipeline_status["live_pipeline_ready"])
    mode = "live_ml_pipeline" if live_ready else "fallback"
    detail = str(pipeline_status["detail"] or "")
    return VideoRuntimeStatus(
        cv2_available=frame_decoder.cv2_available(),
        mediapipe_available=False,
        model_asset_present=bool(pipeline_status["cascade_ready"]),
        live_pipeline_ready=live_ready,
        mode=mode,
        detail=detail,
    )
