import asyncio
from fastapi import APIRouter
from app.models.persona import PersonaGenerateRequest, PersonaResponse
from app.services import persona_service

router = APIRouter()


@router.post("/generate", response_model=PersonaResponse)
async def generate_persona(req: PersonaGenerateRequest):
    await asyncio.sleep(0.6)
    return await persona_service.generate_persona(
        req.prompt,
        req.industry,
        req.difficulty,
        behavior_sliders=req.behavior_sliders,
        behavior_toggles=req.behavior_toggles,
    )
