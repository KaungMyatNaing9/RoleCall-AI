from fastapi import APIRouter
from app.models.evaluation import EvaluationGenerateRequest, EvaluationReport
from app.services import mock_service, claude_service, simulation_service
from app.services import persona_service

router = APIRouter()


@router.post("/generate", response_model=EvaluationReport)
async def generate_evaluation(req: EvaluationGenerateRequest):
    if req.transcript:
        simulation_service.import_transcript(req.session_id, req.transcript)

    history = simulation_service.SESSION_STORE.get(req.session_id, {}).get("history", [])

    persona = persona_service.PERSONA_STORE.get(req.persona_id)
    persona_name = persona.name if persona else "the caller"

    scenario = persona_service.SCENARIO_STORE.get(req.scenario_id)
    scenario_title = scenario.get("title", "") if scenario else ""
    difficulty = scenario.get("difficulty", "Medium") if scenario else "Medium"
    industry = scenario.get("industry", "Healthcare") if scenario else "Healthcare"

    rubric = persona_service.RUBRIC_STORE.get(req.rubric_id)
    rubric_items = rubric.items if rubric else mock_service.MOCK_RUBRIC.items

    if not claude_service.is_available() or not history:
        report = mock_service.get_report(req.session_id)
        return report.model_copy(
            update={
                "persona_name": persona_name,
                "difficulty": difficulty,
                "industry": industry,
                "mode": req.mode,
            }
        )

    audio, ta_interruptions = simulation_service.compute_session_audio_summary(req.session_id)
    timestamps = simulation_service.synthesize_timestamps(history)

    try:
        return await claude_service.generate_evaluation(
            session_id=req.session_id,
            history=history,
            timestamps=timestamps,
            rubric_items=rubric_items,
            audio=audio,
            ta_interruptions=ta_interruptions,
            persona_name=persona_name,
            scenario_title=scenario_title,
            difficulty=difficulty,
            industry=industry,
            mode=req.mode,
        )
    except Exception:
        report = mock_service.get_report(req.session_id)
        return report.model_copy(
            update={
                "persona_name": persona_name,
                "difficulty": difficulty,
                "industry": industry,
                "mode": req.mode,
            }
        )
