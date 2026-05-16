import asyncio
from fastapi import APIRouter
from app.models.simulation import SimulationRespondRequest, SimulationTurn
from app.services import mock_service

router = APIRouter()


@router.post("/respond", response_model=SimulationTurn)
async def simulation_respond(req: SimulationRespondRequest):
    await asyncio.sleep(0.3)
    return mock_service.get_next_turn(req.session_id, req.turn_index, req.user_message)


@router.get("/transcript/{session_id}")
async def get_transcript(session_id: str):
    return mock_service.get_full_transcript()
