import asyncio
from fastapi import APIRouter
from app.models.persona import PersonaGenerateRequest, PersonaResponse
from app.services import mock_service, claude_service, persona_service

router = APIRouter()


@router.post("/generate", response_model=PersonaResponse)
async def generate_persona(req: PersonaGenerateRequest):
    if claude_service.is_available():
        persona = await claude_service.generate_persona(req.prompt, req.industry, req.difficulty)
        persona_service.PERSONA_STORE[persona.id] = persona
        return persona
    await asyncio.sleep(0.6)
    return await persona_service.generate_persona(req.prompt, req.industry, req.difficulty)
