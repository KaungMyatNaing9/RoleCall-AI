import asyncio
from fastapi import APIRouter, HTTPException
from app.models.simulation import (
    SimulationRespondRequest,
    SimulationTurn,
    CreateAgentRequest,
    CreateAgentResponse,
    SignedUrlResponse,
)
from app.services import mock_service, elevenlabs_service, simulation_service

router = APIRouter()


@router.post("/create-agent", response_model=CreateAgentResponse)
async def create_agent(req: CreateAgentRequest):
    if not elevenlabs_service.is_available():
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY not configured")
    agent_id = await elevenlabs_service.create_agent(req.persona, req.scenario, req.rubric)
    return CreateAgentResponse(agent_id=agent_id)


@router.get("/signed-url/{agent_id}", response_model=SignedUrlResponse)
async def get_signed_url(agent_id: str):
    if not elevenlabs_service.is_available():
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY not configured")
    signed_url = await elevenlabs_service.get_signed_url(agent_id)
    return SignedUrlResponse(signed_url=signed_url)


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
