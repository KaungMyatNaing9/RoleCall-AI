import asyncio
from fastapi import APIRouter
from app.models.persona import PersonaGenerateRequest, PersonaResponse
from app.services import mock_service

router = APIRouter()


@router.post("/generate", response_model=PersonaResponse)
async def generate_persona(req: PersonaGenerateRequest):
    await asyncio.sleep(0.6)
    return mock_service.get_persona(req.prompt, req.industry)
