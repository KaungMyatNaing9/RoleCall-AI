from pydantic import BaseModel, Field


class ScenarioGenerateRequest(BaseModel):
    persona_id: str
    industry: str = "Healthcare"
    difficulty: str = "Medium"
    mode: str = "video"
    behavior_sliders: dict[str, float] = Field(default_factory=dict)
    behavior_toggles: dict[str, bool] = Field(default_factory=dict)


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
