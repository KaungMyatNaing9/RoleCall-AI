from pydantic import BaseModel, Field


class RubricGenerateRequest(BaseModel):
    scenario_id: str
    industry: str = "Healthcare"
    difficulty: str = "Medium"
    mode: str = "adaptive"
    evaluation_focus: list[str] = Field(default_factory=list)


class RubricItem(BaseModel):
    name: str
    weight: int
    is_hot: bool = False
    description: str = ""


class RubricResponse(BaseModel):
    id: str
    items: list[RubricItem]
    total_weight: int = 100
