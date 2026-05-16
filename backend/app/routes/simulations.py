import asyncio
from fastapi import APIRouter
from app.models.simulation import SimulationRespondRequest, SimulationTurn
from app.services import simulation_service

router = APIRouter()


@router.post("/respond", response_model=SimulationTurn)
async def simulation_respond(req: SimulationRespondRequest):
    await asyncio.sleep(0.3)
    return await simulation_service.respond(
        req.session_id,
        req.turn_index,
        req.user_message,
        persona_id=req.persona_id,
        scenario_id=req.scenario_id,
        mode=req.mode,
    )


@router.get("/transcript/{session_id}")
async def get_transcript(session_id: str):
    return simulation_service.get_full_transcript(session_id)
