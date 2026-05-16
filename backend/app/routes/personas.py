import asyncio
from fastapi import APIRouter
from app.models.persona import PersonaGenerateRequest, PersonaResponse
from app.services import mock_service, claude_service

router = APIRouter()


@router.post("/generate", response_model=PersonaResponse)
async def generate_persona(req: PersonaGenerateRequest):
    if claude_service.is_available():
        return await claude_service.generate_persona(req.prompt, req.industry, req.difficulty)
    await asyncio.sleep(0.6)
    return mock_service.get_persona(req.prompt, req.industry)
