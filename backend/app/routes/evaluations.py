from fastapi import APIRouter
from app.models.evaluation import EvaluationGenerateRequest, EvaluationReport
from app.services import evaluation_service, simulation_service

router = APIRouter()


@router.post("/generate", response_model=EvaluationReport)
async def generate_evaluation(req: EvaluationGenerateRequest):
    if req.transcript:
        simulation_service.import_transcript(req.session_id, req.transcript)
    return await evaluation_service.generate_evaluation(
        session_id=req.session_id,
        persona_id=req.persona_id,
        scenario_id=req.scenario_id,
        rubric_id=req.rubric_id,
        mode=req.mode,
        persona_name_fallback=req.persona_name,
        industry_fallback=req.industry,
        difficulty_fallback=req.difficulty,
    )
