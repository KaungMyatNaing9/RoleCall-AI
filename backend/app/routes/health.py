from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "0.2.0",
        "features": [
            "persona_prompt",
            "behavior_sliders",
            "simulation_inline_context",
            "voice_synthesize",
            "live_coaching",
        ],
    }
