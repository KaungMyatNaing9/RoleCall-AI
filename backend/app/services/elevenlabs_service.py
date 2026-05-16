import os
import httpx

from app.models.persona import PersonaResponse
from app.models.scenario import ScenarioResponse
from app.models.rubric import RubricResponse

ELEVENLABS_BASE = "https://api.elevenlabs.io"

# Map avatar_preset → ElevenLabs premade voice ID
# Voices chosen by age/gender to match persona type
VOICE_PRESETS: dict[str, str] = {
    "elderly_woman":      "jBpfuIE2acCO8z3wKNLl",  # Glinda — warm, older female
    "elderly_man":        "VR6AewLTigWG4xSOukaG",  # Arnold — mature male
    "middle_aged_woman":  "EXAVITQu4vr4xnSDxMaL",  # Bella — warm, measured female
    "middle_aged_man":    "onwK4e9ZLuTAKqWW03F9",  # Daniel — authoritative male
    "young_woman":        "21m00Tcm4TlvDq8ikWAM",  # Rachel — clear, young US female
    "young_man":          "TxGEqnHWrfWFTfGW9XjX",  # Josh — young male
}
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel


def _voice_id(persona: PersonaResponse) -> str:
    return VOICE_PRESETS.get(persona.avatar_preset, DEFAULT_VOICE_ID)


def _build_system_prompt(
    persona: PersonaResponse,
    scenario: ScenarioResponse,
    rubric: RubricResponse,
) -> str:
    traits = ", ".join(persona.traits)
    hot = [i for i in rubric.items if i.is_hot]
    regular = [i for i in rubric.items if not i.is_hot]

    hot_lines = "\n".join(f"- {i.name}: {i.description}" for i in hot) or "None"
    regular_lines = "\n".join(f"- {i.name}: {i.description}" for i in regular) or "None"

    first_name = persona.name.split()[0]

    return f"""You are {persona.name}, a {persona.age}-year-old {persona.role}. \
This is a {scenario.industry} communication training simulation — stay fully in character at all times.

## Your Character
- Mood: {persona.mood}
- Traits: {traits}
- Behavior: {persona.behavior}
- Voice style: {persona.voice_style}
- Your goal: {persona.goal}

## The Scenario
{scenario.description}

The trainee is playing: {scenario.your_role}
Their objective: {scenario.objective}
Expected duration: {scenario.duration}

## Hidden Red Flag
{persona.hidden_red_flag or "No hidden red flag in this scenario."}
Only surface this if the trainee probes with the right questions or after sufficient time. \
Never volunteer it unprompted.

## Rules
- Respond as {first_name} would — naturally, not overly cooperative.
- Do not tell the trainee what they are doing right or wrong.
- If the trainee achieves "{scenario.success_condition}", end the call naturally.
- Do not break character under any circumstances.

## Critical Competencies (do NOT disclose to trainee)
{hot_lines}

## Supporting Competencies
{regular_lines}
"""


def is_available() -> bool:
    return bool(os.getenv("ELEVENLABS_API_KEY"))


async def create_agent(
    persona: PersonaResponse,
    scenario: ScenarioResponse,
    rubric: RubricResponse,
) -> str:
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = _voice_id(persona)
    system_prompt = _build_system_prompt(persona, scenario, rubric)

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{ELEVENLABS_BASE}/v1/convai/agents/create",
            headers={"xi-api-key": api_key, "Content-Type": "application/json"},
            json={
                "name": f"RoleCall — {persona.name}",
                "conversation_config": {
                    "agent": {
                        "prompt": {
                            "prompt": system_prompt,
                            "llm": "claude-3-5-sonnet",
                        },
                        "first_message": persona.opening_line,
                        "language": "en",
                    },
                    "tts": {"voice_id": voice_id},
                },
            },
            timeout=30.0,
        )
        response.raise_for_status()
        return response.json()["agent_id"]


async def get_signed_url(agent_id: str) -> str:
    api_key = os.getenv("ELEVENLABS_API_KEY")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{ELEVENLABS_BASE}/v1/convai/conversation/get_signed_url",
            headers={"xi-api-key": api_key},
            params={"agent_id": agent_id},
            timeout=15.0,
        )
        response.raise_for_status()
        return response.json()["signed_url"]
