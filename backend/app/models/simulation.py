from pydantic import BaseModel
from typing import Optional


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
