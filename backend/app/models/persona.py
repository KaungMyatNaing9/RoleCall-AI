from pydantic import BaseModel
from typing import Optional


class PersonaGenerateRequest(BaseModel):
    prompt: str
    industry: str = "Healthcare"
    difficulty: str = "Medium"
    behavior_toggles: dict = {}


class PersonaResponse(BaseModel):
    id: str
    name: str
    age: int
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
