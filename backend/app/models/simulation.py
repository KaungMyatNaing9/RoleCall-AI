from pydantic import BaseModel
from typing import Optional
from app.models.persona import PersonaResponse
from app.models.scenario import ScenarioResponse
from app.models.rubric import RubricResponse
from app.models.signals import AudioSignals, VideoSignals


class SimulationRespondRequest(BaseModel):
    session_id: str
    turn_index: int
    user_message: str
    persona_id: str | None = None
    scenario_id: str | None = None
    mode: str | None = None


class TranscriptEntry(BaseModel):
    speaker: str
    timestamp: str
    text: str
    is_critical: bool = False


class LiveCoaching(BaseModel):
    phase: str = "opening"
    summary: str
    next_best_action: str
    suggested_response: str
    strengths: list[str] = []
    warnings: list[str] = []
    clarity_estimate: int = 70
    empathy_estimate: int = 70
    turn_taking_estimate: int = 70
    risk_cue_count: int = 0


class SimulationTurn(BaseModel):
    session_id: str
    turn_index: int
    phase: str = "opening"
    entry: TranscriptEntry
    call_ended: bool = False
    audio_signals: AudioSignals
    video_signals: Optional[VideoSignals] = None
    coaching: LiveCoaching


class CreateAgentRequest(BaseModel):
    persona: PersonaResponse
    scenario: ScenarioResponse
    rubric: RubricResponse


class CreateAgentResponse(BaseModel):
    agent_id: str


class SignedUrlResponse(BaseModel):
    signed_url: str
