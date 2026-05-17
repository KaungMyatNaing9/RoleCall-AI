import asyncio
from fastapi import APIRouter
from app.models.scenario import ScenarioGenerateRequest, ScenarioResponse
from app.services import persona_service

router = APIRouter()


@router.post("/generate", response_model=ScenarioResponse)
async def generate_scenario(req: ScenarioGenerateRequest):
    await asyncio.sleep(0.5)
    payload = await persona_service.generate_scenario(
        req.persona_id,
        req.industry,
        req.difficulty,
        req.mode,
        behavior_sliders=req.behavior_sliders,
        behavior_toggles=req.behavior_toggles,
    )
    return ScenarioResponse(**payload)
