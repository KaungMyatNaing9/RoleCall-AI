from pydantic import BaseModel
from typing import Optional
from app.models.persona import PersonaResponse
from app.models.scenario import ScenarioResponse
from app.models.rubric import RubricResponse


class SimulationRespondRequest(BaseModel):
    session_id: str
    turn_index: int
    user_message: str


class TranscriptEntry(BaseModel):
    speaker: str
    timestamp: str
    text: str
    is_critical: bool = False


class SimulationTurn(BaseModel):
    session_id: str
    turn_index: int
    entry: TranscriptEntry
    call_ended: bool = False


class CreateAgentRequest(BaseModel):
    persona: PersonaResponse
    scenario: ScenarioResponse
    rubric: RubricResponse


class CreateAgentResponse(BaseModel):
    agent_id: str


class SignedUrlResponse(BaseModel):
    signed_url: str
