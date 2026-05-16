from pydantic import BaseModel

PRIVACY_NOTICE = (
    "Video interaction signals are coaching estimates. "
    "They are not emotion detection, truth detection, "
    "psychological assessment, or medical assessment."
)


class VideoSignals(BaseModel):
    eye_contact_estimate: float = 0.62
    face_centered: bool = True
    head_movement_stability: float = 0.78
    facial_engagement_estimate: float = 0.84
    speaking_pace_wpm: int = 164
    interruption_count: int = 3
    filler_word_count: int = 12
    privacy_notice: str = PRIVACY_NOTICE


class FrameAnalysisRequest(BaseModel):
    frame_b64: str
    session_id: str
    frame_index: int = 0


class FrameAnalysisResponse(BaseModel):
    signals: VideoSignals
    frame_index: int
    session_id: str


class AudioSignals(BaseModel):
    speaking_pace_wpm: int = 164
    pause_count: int = 7
    avg_pause_duration_s: float = 1.8
    longest_pause_s: float = 4.2
    filler_word_count: int = 12
    interruption_count: int = 3
    avg_response_time_s: float = 18.0
    total_speaking_time_s: float = 204.0


class SessionSummaryRequest(BaseModel):
    session_id: str
    duration_s: float = 342.0
    transcript: str = ""  # user speech text for filler-word and pace computation
