import asyncio
from fastapi import APIRouter
from app.models.scenario import ScenarioGenerateRequest, ScenarioResponse
from app.services import mock_service, claude_service, persona_service

router = APIRouter()


@router.post("/generate", response_model=ScenarioResponse)
async def generate_scenario(req: ScenarioGenerateRequest):
    if claude_service.is_available():
        scenario = await claude_service.generate_scenario(req.persona_id, req.industry, req.difficulty, req.mode)
        persona_service.SCENARIO_STORE[scenario.id] = scenario.model_dump()
        return scenario
    await asyncio.sleep(0.5)
    payload = await persona_service.generate_scenario(req.persona_id, req.industry, req.difficulty, req.mode)
    return ScenarioResponse(**payload)
