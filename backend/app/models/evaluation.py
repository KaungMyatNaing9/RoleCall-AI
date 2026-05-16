from pydantic import BaseModel
from typing import Optional
from app.models.signals import VideoSignals, AudioSignals, PRIVACY_NOTICE


class TranscriptSyncEntry(BaseModel):
    speaker: str
    text: str
    timestamp: str = ""


class EvaluationGenerateRequest(BaseModel):
    session_id: str
    persona_id: str = "persona-margaret-001"
    scenario_id: str = "scenario-postdischarge-001"
    rubric_id: str = "rubric-healthcare-001"
    transcript: list[TranscriptSyncEntry] = []
    mode: str = "video"


class KeyMoment(BaseModel):
    timestamp: str
    position_pct: float
    type: str  # "strong" | "improve" | "risk" | "question"
    title: str
    excerpt: str
    why_it_mattered: Optional[str] = None
    better_response: Optional[str] = None
    score_impact: Optional[int] = None


class AnnotatedTurn(BaseModel):
    speaker: str
    timestamp: str
    text: str
    tag: Optional[str] = None  # "strong" | "improve" | "risk" | "question"
    tag_label: Optional[str] = None


class CoachFeedback(BaseModel):
    did_well: str
    missed: str
    try_next: str
    next_drill_title: str


class MultimodalInsightItem(BaseModel):
    label: str
    value: str
    note: Optional[str] = None
    tone: str = "ok"  # "ok" | "warn" | "bad"


class EvaluationReport(BaseModel):
    session_id: str
    overall_score: int
    skill_scores: dict[str, int]
    key_moments: list[KeyMoment]
    annotated_transcript: list[AnnotatedTurn]
    multimodal_insights: list[MultimodalInsightItem]
    coach_feedback: CoachFeedback
    next_practice: list[dict]
    privacy_notice: str = PRIVACY_NOTICE
    duration: str = "5:42"
    mode: str = "video"
    industry: str = "Healthcare"
    difficulty: str = "Medium"
    persona_name: str = "Margaret Lewis"
