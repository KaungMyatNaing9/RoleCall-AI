import asyncio
from fastapi import APIRouter
from app.models.scenario import ScenarioGenerateRequest, ScenarioResponse
from app.services import mock_service

router = APIRouter()


@router.post("/generate", response_model=ScenarioResponse)
async def generate_scenario(req: ScenarioGenerateRequest):
    await asyncio.sleep(0.5)
    return mock_service.get_scenario(req.persona_id, req.industry)
