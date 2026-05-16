import os
import json
import uuid
import anthropic

from app.models.persona import PersonaResponse
from app.models.scenario import ScenarioResponse
from app.models.rubric import RubricResponse, RubricItem

_client: anthropic.AsyncAnthropic | None = None

MODEL = "claude-sonnet-4-6"


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def is_available() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


async def generate_persona(prompt: str, industry: str, difficulty: str = "Medium") -> PersonaResponse:
    client = _get_client()

    response = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=(
            "You generate realistic roleplay personas for communication training simulations. "
            "Respond with valid JSON only — no markdown fences, no explanation."
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Generate a {industry} communication training persona.\n"
                f"Difficulty: {difficulty}\n"
                f"Description: {prompt}\n\n"
                "Return ONLY a JSON object with these exact fields:\n"
                "{\n"
                '  "name": "full name",\n'
                '  "age": <integer>,\n'
                '  "role": "job title or patient/client role",\n'
                '  "mood": "current emotional state",\n'
                '  "traits": ["trait1", "trait2", "trait3"],\n'
                '  "goal": "what this persona wants from the interaction",\n'
                '  "hidden_red_flag": "a subtle concern the trainee must detect, or null",\n'
                '  "behavior": "how they will behave during the interaction",\n'
                '  "voice_style": "speaking style description",\n'
                '  "opening_line": "their first line of dialogue when the interaction starts",\n'
                '  "avatar_preset": "one of: elderly_woman, elderly_man, middle_aged_woman, middle_aged_man, young_woman, young_man",\n'
                '  "sample_lines": ["line1", "line2", "line3", "line4", "line5"]\n'
                "}"
            ),
        }],
    )

    data = json.loads(response.content[0].text)
    return PersonaResponse(id=f"persona-{uuid.uuid4().hex[:8]}", **data)


async def generate_scenario(persona_id: str, industry: str, difficulty: str = "Medium", mode: str = "video") -> ScenarioResponse:
    client = _get_client()

    response = await client.messages.create(
        model=MODEL,
        max_tokens=512,
        system=(
            "You generate roleplay scenarios for communication training simulations. "
            "Respond with valid JSON only — no markdown fences, no explanation."
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Generate a {industry} communication training scenario.\n"
                f"Difficulty: {difficulty}\n"
                f"Mode: {mode}\n\n"
                "Return ONLY a JSON object with these exact fields:\n"
                "{\n"
                '  "title": "short scenario title",\n'
                '  "description": "2-3 sentence scenario description",\n'
                '  "your_role": "the trainee\'s professional role in this scenario",\n'
                '  "duration": "estimated duration e.g. \'5-7 minutes\'",\n'
                '  "objective": "what the trainee must accomplish",\n'
                '  "success_condition": "specific criteria for a successful outcome",\n'
                f'  "difficulty": "{difficulty}",\n'
                f'  "industry": "{industry}"\n'
                "}"
            ),
        }],
    )

    data = json.loads(response.content[0].text)
    return ScenarioResponse(id=f"scenario-{uuid.uuid4().hex[:8]}", **data)


async def generate_rubric(scenario_id: str, industry: str, evaluation_focus: list[str] = []) -> RubricResponse:
    client = _get_client()

    focus_text = ", ".join(evaluation_focus) if evaluation_focus else "general communication skills"

    response = await client.messages.create(
        model=MODEL,
        max_tokens=512,
        system=(
            "You generate evaluation rubrics for communication training simulations. "
            "Respond with valid JSON only — no markdown fences, no explanation."
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Generate an evaluation rubric for a {industry} communication training simulation.\n"
                f"Evaluation focus: {focus_text}\n\n"
                "Return ONLY a JSON object with this exact structure:\n"
                "{\n"
                '  "items": [\n'
                '    {\n'
                '      "name": "skill name",\n'
                '      "weight": <integer>,\n'
                '      "is_hot": <boolean — true only for critical safety/escalation items>,\n'
                '      "description": "what is being evaluated"\n'
                "    }\n"
                "  ]\n"
                "}\n\n"
                "Rules: 5-8 items, all weights are integers summing to exactly 100, "
                "is_hot=true for at most 2 critical safety or escalation items."
            ),
        }],
    )

    data = json.loads(response.content[0].text)
    items = [RubricItem(**item) for item in data["items"]]
    total = sum(i.weight for i in items)
    return RubricResponse(id=f"rubric-{uuid.uuid4().hex[:8]}", items=items, total_weight=total)
