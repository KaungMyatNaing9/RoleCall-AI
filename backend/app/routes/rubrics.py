import asyncio
from fastapi import APIRouter
from app.models.rubric import RubricGenerateRequest, RubricResponse
from app.services import mock_service

router = APIRouter()


@router.post("/generate", response_model=RubricResponse)
async def generate_rubric(req: RubricGenerateRequest):
    await asyncio.sleep(0.4)
    return mock_service.get_rubric(req.scenario_id, req.industry, req.evaluation_focus)
