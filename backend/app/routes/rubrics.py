import asyncio
from fastapi import APIRouter
from app.models.rubric import RubricGenerateRequest, RubricResponse
from app.services import persona_service, rubric_service

router = APIRouter()


@router.post("/generate", response_model=RubricResponse)
async def generate_rubric(req: RubricGenerateRequest):
    await asyncio.sleep(0.4)
    rubric = await rubric_service.generate_rubric(
        req.scenario_id,
        req.industry,
        req.difficulty,
        req.mode,
        req.evaluation_focus,
    )
    persona_service.RUBRIC_STORE[rubric.id] = rubric
    return rubric
