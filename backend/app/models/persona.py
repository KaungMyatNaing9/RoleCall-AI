from pydantic import BaseModel, Field
from typing import Optional


class PersonaGenerateRequest(BaseModel):
    prompt: str
    industry: str = "Healthcare"
    difficulty: str = "Medium"
    behavior_sliders: dict[str, float] = Field(default_factory=dict)
    behavior_toggles: dict[str, bool] = Field(default_factory=dict)


class PersonaResponse(BaseModel):
    id: str
    name: str
    age: int
    gender: str = "unspecified"
    role: str
    mood: str
    traits: list[str]
    goal: str
    hidden_red_flag: Optional[str] = None
    behavior: str
    voice_style: str
    opening_line: str
    avatar_preset: str
    sample_lines: list[str] = []
