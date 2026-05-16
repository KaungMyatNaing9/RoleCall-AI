from pydantic import BaseModel
from typing import Optional


class ScenarioGenerateRequest(BaseModel):
    persona_id: str
    industry: str = "Healthcare"
    difficulty: str = "Medium"
    mode: str = "video"


class ScenarioResponse(BaseModel):
    id: str
    title: str
    description: str
    your_role: str
    duration: str
    objective: str
    success_condition: str
    difficulty: str
    industry: str
