import asyncio
from fastapi import APIRouter
from app.models.evaluation import EvaluationGenerateRequest, EvaluationReport
from app.services import mock_service

router = APIRouter()


@router.post("/generate", response_model=EvaluationReport)
async def generate_evaluation(req: EvaluationGenerateRequest):
    await asyncio.sleep(0.8)
    return mock_service.get_report(req.session_id)
