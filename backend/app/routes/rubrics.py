import asyncio
from fastapi import APIRouter, HTTPException
from app.models.rubric import RubricGenerateRequest, RubricResponse
from app.services import mock_service, claude_service, persona_service

router = APIRouter()


@router.post("/generate", response_model=RubricResponse)
async def generate_rubric(req: RubricGenerateRequest):
    if claude_service.is_available():
        try:
            rubric = await claude_service.generate_rubric(req.scenario_id, req.industry, req.evaluation_focus)
        except ValueError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        persona_service.RUBRIC_STORE[rubric.id] = rubric
        return rubric
    await asyncio.sleep(0.4)
    rubric = mock_service.get_rubric(req.scenario_id, req.industry, req.evaluation_focus)
    persona_service.RUBRIC_STORE[rubric.id] = rubric
    return rubric
