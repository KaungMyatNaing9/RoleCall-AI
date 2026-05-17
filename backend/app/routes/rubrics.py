import asyncio
from fastapi import APIRouter, HTTPException
from app.models.rubric import RubricGenerateRequest, RubricResponse
from app.services import persona_service, rubric_service, claude_service

router = APIRouter()


@router.post("/generate", response_model=RubricResponse)
async def generate_rubric(req: RubricGenerateRequest):
    if claude_service.is_available():
        try:
            rubric = await claude_service.generate_rubric(req.scenario_id, req.industry, req.evaluation_focus)
        except (ValueError, KeyError, TypeError) as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        persona_service.RUBRIC_STORE[rubric.id] = rubric
        return rubric
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
