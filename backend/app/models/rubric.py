from pydantic import BaseModel


class RubricGenerateRequest(BaseModel):
    scenario_id: str
    industry: str = "Healthcare"
    evaluation_focus: list[str] = []


class RubricItem(BaseModel):
    name: str
    weight: int
    is_hot: bool = False
    description: str = ""


class RubricResponse(BaseModel):
    id: str
    items: list[RubricItem]
    total_weight: int = 100
