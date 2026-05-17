import os
import json
import re
import uuid
import anthropic

from app.models.persona import PersonaResponse
from app.models.scenario import ScenarioResponse
from app.models.rubric import RubricResponse, RubricItem
from app.models.signals import AudioSignals, PRIVACY_NOTICE
from app.models.evaluation import (
    EvaluationReport, KeyMoment, AnnotatedTurn, CoachFeedback, MultimodalInsightItem,
)

_client: anthropic.AsyncAnthropic | None = None

MODEL = "claude-sonnet-4-6"


def _get_client() -> anthropic.AsyncAnthropic:
    global _client
    if _client is None:
        _client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


def is_available() -> bool:
    return bool(os.getenv("ANTHROPIC_API_KEY"))


def _strip_json_block(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()
    return cleaned


def _parse_json(text: str) -> dict:
    return json.loads(_strip_json_block(text))


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

    data = _parse_json(response.content[0].text)
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

    data = _parse_json(response.content[0].text)
    return ScenarioResponse(id=f"scenario-{uuid.uuid4().hex[:8]}", **data)


async def generate_rubric(scenario_id: str, industry: str, evaluation_focus: list[str] = []) -> RubricResponse:
    client = _get_client()

    focus_text = ", ".join(evaluation_focus) if evaluation_focus else "general communication skills"

    user_content = (
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
        "Rules: exactly 6 items, all weights are integers summing to exactly 100, "
        "is_hot=true for at most 2 critical safety or escalation items, "
        "each description is one short sentence (max 12 words)."
    )

    data: dict | None = None
    for attempt in range(2):
        response = await client.messages.create(
            model=MODEL,
            max_tokens=1536 if attempt == 0 else 2048,
            system=(
                "You generate evaluation rubrics for communication training simulations. "
                "Respond with valid JSON only — no markdown fences, no explanation. "
                "Always complete the full JSON object."
            ),
            messages=[{"role": "user", "content": user_content}],
        )
        if response.stop_reason == "max_tokens":
            continue
        try:
            data = _parse_json(response.content[0].text)
            break
        except json.JSONDecodeError:
            continue

    if data is None:
        raise ValueError("Claude returned unparseable rubric JSON after 2 attempts")

    raw_items = data.get("items")
    if not isinstance(raw_items, list) or not raw_items:
        raise ValueError("Claude rubric JSON missing a non-empty 'items' list")

    try:
        items = [RubricItem(**item) for item in raw_items]
    except (TypeError, ValueError) as exc:
        raise ValueError(f"Invalid rubric item shape: {exc}") from exc
    total = sum(i.weight for i in items)
    return RubricResponse(id=f"rubric-{uuid.uuid4().hex[:8]}", items=items, total_weight=total)


def _build_multimodal_insights(audio: AudioSignals, ta_interruptions: int, mode: str) -> list[MultimodalInsightItem]:
    def _tone(value: float, warn_thresh: float, bad_thresh: float, higher_is_worse: bool = True) -> str:
        if higher_is_worse:
            return "bad" if value >= bad_thresh else ("warn" if value >= warn_thresh else "ok")
        return "bad" if value <= bad_thresh else ("warn" if value <= warn_thresh else "ok")

    insights = [
        MultimodalInsightItem(
            label="Speaking pace",
            value=f"{audio.speaking_pace_wpm} wpm",
            note="slightly fast" if audio.speaking_pace_wpm > 160 else ("slow" if audio.speaking_pace_wpm < 120 else None),
            tone=_tone(audio.speaking_pace_wpm, 160, 190),
        ),
        MultimodalInsightItem(
            label="Filler words",
            value=str(audio.filler_word_count),
            note="um, uh, like…" if audio.filler_word_count > 0 else None,
            tone=_tone(audio.filler_word_count, 5, 12),
        ),
        MultimodalInsightItem(
            label="Interruptions (turn)",
            value=str(ta_interruptions),
            tone=_tone(ta_interruptions, 2, 5),
        ),
        MultimodalInsightItem(
            label="Avg response latency",
            value=f"{audio.avg_response_time_s}s",
            tone=_tone(audio.avg_response_time_s, 6.0, 10.0),
        ),
        MultimodalInsightItem(
            label="Longest pause",
            value=f"{audio.longest_pause_s}s",
            tone=_tone(audio.longest_pause_s, 4.0, 7.0),
        ),
    ]
    if mode == "video":
        insights.insert(
            0,
            MultimodalInsightItem(label="Eye-contact estimate", value="—", note="derived from presence", tone="ok"),
        )
    return insights


def _build_eval_prompt(
    history: list[dict[str, str]],
    timestamps: list[str],
    rubric_items: list[RubricItem],
    audio: AudioSignals,
    ta_interruptions: int,
    persona_name: str,
    scenario_title: str,
    difficulty: str,
    industry: str,
    mode: str,
) -> str:
    rubric_lines = "\n".join(
        f"  - {item.name} (weight {item.weight}{'  ★HOT' if item.is_hot else ''}): {item.description}"
        for item in rubric_items
    )
    rubric_names = ", ".join(f'"{item.name}"' for item in rubric_items)

    transcript_lines = "\n".join(
        f"[{timestamps[i]}] {'YOU' if turn['speaker'] == 'user' else persona_name.upper()}: {turn['text']}"
        for i, turn in enumerate(history)
    )
    total_time = timestamps[-1] if timestamps else "00:00"

    return (
        f"SCENARIO: {scenario_title or 'Communication training'}\n"
        f"INDUSTRY: {industry} | DIFFICULTY: {difficulty} | MODE: {mode}\n"
        f"PERSONA: {persona_name}\n\n"
        f"RUBRIC — use these exact names in skill_scores:\n{rubric_lines}\n\n"
        f"AUDIO SIGNALS (session summary):\n"
        f"  Speaking pace: {audio.speaking_pace_wpm} wpm\n"
        f"  Filler words: {audio.filler_word_count}\n"
        f"  Interruptions (turn-alternation): {ta_interruptions}\n"
        f"  Avg response latency: {audio.avg_response_time_s}s\n"
        f"  Longest pause: {audio.longest_pause_s}s\n\n"
        f"TRANSCRIPT (approximate timestamps):\n{transcript_lines}\n"
        f"TOTAL DURATION: {total_time}\n\n"
        "Return ONLY a JSON object with exactly these fields:\n"
        "{\n"
        '  "overall_score": <0-100 integer — weighted average of skill_scores using rubric weights>,\n'
        f'  "skill_scores": {{{rubric_names}: <0-100>}},\n'
        '  "key_moments": [\n'
        "    {\n"
        '      "timestamp": "<MM:SS from transcript>",\n'
        '      "position_pct": <0.0-1.0 fraction of total call>,\n'
        '      "type": "<strong|improve|risk|question>",\n'
        '      "title": "<5-8 word title>",\n'
        '      "excerpt": "<exact quote from transcript>",\n'
        '      "why_it_mattered": "<1-2 sentences or null>",\n'
        '      "better_response": "<alternative wording or null>",\n'
        '      "score_impact": <null or negative integer>\n'
        "    }\n"
        "  ],\n"
        '  "annotated_transcript": [\n'
        "    {\n"
        '      "speaker": "<You or ' + persona_name + '>",\n'
        '      "timestamp": "<MM:SS>",\n'
        '      "text": "<exact turn text>",\n'
        '      "tag": "<strong|improve|risk|question|null>",\n'
        '      "tag_label": "<short label or null>"\n'
        "    }\n"
        "  ],\n"
        '  "coach_feedback": {\n'
        '    "did_well": "<2-3 sentences>",\n'
        '    "missed": "<2-3 sentences on the highest-impact failure>",\n'
        '    "try_next": "<suggested follow-up practice>",\n'
        '    "next_drill_title": "<title of top recommended drill>"\n'
        "  },\n"
        '  "next_practice": [\n'
        "    {\n"
        '      "persona": "<persona slug e.g. margaret|aanya|james|elena|david>",\n'
        '      "name": "<drill name>",\n'
        '      "difficulty": "<Easy|Medium|Hard>",\n'
        '      "description": "<1 sentence>",\n'
        '      "why": "<why based on session performance>"\n'
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Rules:\n"
        "- key_moments: 3 to 6 entries covering the most significant moments\n"
        "- annotated_transcript: include ALL turns; set tag/tag_label to null for unremarkable turns\n"
        "- next_practice: exactly 3 drills\n"
        "- score_impact: only for risk/improve moments where a mistake meaningfully hurt the score"
    )


async def generate_evaluation(
    session_id: str,
    history: list[dict[str, str]],
    timestamps: list[str],
    rubric_items: list[RubricItem],
    audio: AudioSignals,
    ta_interruptions: int,
    persona_name: str = "the caller",
    scenario_title: str = "",
    difficulty: str = "Medium",
    industry: str = "Healthcare",
    mode: str = "video",
) -> EvaluationReport:
    client = _get_client()
    user_prompt = _build_eval_prompt(
        history, timestamps, rubric_items, audio, ta_interruptions,
        persona_name, scenario_title, difficulty, industry, mode,
    )

    async def _call_claude() -> dict:
        resp = await client.messages.create(
            model=MODEL,
            max_tokens=4096,
            system=(
                "You are a professional communication coach evaluating a trainee's roleplay call. "
                "Analyze the transcript, rubric, and session signals, then return structured JSON feedback. "
                "Respond with valid JSON only — no markdown fences, no explanation."
            ),
            messages=[{"role": "user", "content": user_prompt}],
        )
        return json.loads(_strip_json_block(resp.content[0].text))

    data: dict | None = None
    for _attempt in range(2):
        try:
            data = await _call_claude()
            break
        except (json.JSONDecodeError, KeyError, IndexError):
            pass

    if data is None:
        raise ValueError("Claude returned unparseable JSON after 2 attempts")

    total_duration_s = max(1.0, sum(
        (len(t["text"].split()) / (118 if t["speaker"] == "patient" else 130)) * 60 + 1.5
        for t in history
    ) + 5)
    duration_str = f"{int(total_duration_s) // 60}:{int(total_duration_s) % 60:02d}"

    key_moments = [KeyMoment(**km) for km in (data.get("key_moments") or [])]
    annotated = [AnnotatedTurn(**at) for at in (data.get("annotated_transcript") or [])]
    coach = CoachFeedback(**data["coach_feedback"])
    multimodal = _build_multimodal_insights(audio, ta_interruptions, mode)

    return EvaluationReport(
        session_id=session_id,
        overall_score=int(data.get("overall_score", 70)),
        skill_scores={k: int(v) for k, v in (data.get("skill_scores") or {}).items()},
        key_moments=key_moments,
        annotated_transcript=annotated,
        multimodal_insights=multimodal,
        coach_feedback=coach,
        next_practice=data.get("next_practice") or [],
        privacy_notice=PRIVACY_NOTICE,
        duration=duration_str,
        mode=mode,
        industry=industry,
        difficulty=difficulty,
        persona_name=persona_name,
    )
