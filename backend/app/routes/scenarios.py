import asyncio
from fastapi import APIRouter
from app.models.scenario import ScenarioGenerateRequest, ScenarioResponse
from app.services import mock_service, claude_service

router = APIRouter()


@router.post("/generate", response_model=ScenarioResponse)
async def generate_scenario(req: ScenarioGenerateRequest):
    if claude_service.is_available():
        return await claude_service.generate_scenario(req.persona_id, req.industry, req.difficulty, req.mode)
    await asyncio.sleep(0.5)
    return mock_service.get_scenario(req.persona_id, req.industry)
