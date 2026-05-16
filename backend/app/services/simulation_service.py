import asyncio
import json
from typing import Any
from urllib import request

from app.config import settings
from app.models.signals import AudioSignals, VideoSignals, PRIVACY_NOTICE
from app.models.simulation import LiveCoaching, SimulationTurn, TranscriptEntry
from app.services import mock_service, persona_service


SESSION_STORE: dict[str, dict[str, Any]] = {}

SIMULATION_SYSTEM_PROMPT = """You are the live simulation agent for RoleCall AI.
Stay fully in character as the training persona.
Return JSON only with keys:
- text: the persona's next reply
- should_end_call: boolean

Rules:
- Speak only as the persona.
- Keep replies natural, concise, and conversational.
- Reveal hidden red flags gradually unless the trainee asks directly.
- Do not break character or mention you are an AI.
- Do not narrate actions or analysis.
- If the trainee escalates appropriately, cooperate and allow the call to conclude.
"""


def _post_json(url: str, headers: dict[str, str], payload: dict[str, Any], timeout: float = 45.0) -> dict[str, Any]:
    body = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=body, headers=headers, method="POST")
    with request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


async def _openai_json(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    return await asyncio.to_thread(
        _post_json,
        "https://api.openai.com/v1/chat/completions",
        {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        {
            "model": settings.openai_model,
            "temperature": 0.8,
            "response_format": {"type": "json_object"},
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        },
    )


async def _anthropic_json(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    return await asyncio.to_thread(
        _post_json,
        "https://api.anthropic.com/v1/messages",
        {
            "x-api-key": settings.anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        {
            "model": settings.anthropic_model,
            "max_tokens": 800,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        },
    )


def _is_critical(text: str, hidden_red_flag: str | None) -> bool:
    lower = text.lower()
    flag = (hidden_red_flag or "").lower()
    return bool(
        ("chest tightness" in lower)
        or ("shortness of breath" in lower)
        or ("dizzy" in lower)
        or (flag and flag.split("—")[0].strip() in lower)
    )


def _get_session(session_id: str) -> dict[str, Any]:
    return SESSION_STORE.setdefault(session_id, {"history": [], "last_turn_index": -1})


def _count_filler_words(text: str) -> int:
    lower = f" {text.lower()} "
    total = 0
    for phrase in (" um ", " uh ", " like ", " you know ", " actually ", " basically ", " sort of ", " kind of "):
        total += lower.count(phrase)
    return total


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _build_audio_signals(history: list[dict[str, str]]) -> AudioSignals:
    user_turns = [item["text"] for item in history if item["speaker"] == "user"]
    if not user_turns:
        return AudioSignals(
            speaking_pace_wpm=132,
            pause_count=1,
            avg_pause_duration_s=1.6,
            longest_pause_s=2.3,
            filler_word_count=0,
            interruption_count=0,
            avg_response_time_s=1.8,
            total_speaking_time_s=0.0,
        )

    total_words = sum(len(turn.split()) for turn in user_turns)
    avg_words = total_words / max(1, len(user_turns))
    filler_count = sum(_count_filler_words(turn) for turn in user_turns)
    question_turns = sum(1 for turn in user_turns if "?" in turn)
    short_turns = sum(1 for turn in user_turns if len(turn.split()) <= 4)
    interruption_count = sum(1 for turn in user_turns if turn.strip().startswith(("wait", "hold on", "sorry", "no,")))

    speaking_pace = int(_clamp(118 + avg_words * 4.8 + filler_count * 1.5, 105, 205))
    pause_count = max(1, question_turns + short_turns)
    avg_pause = round(_clamp(2.6 - avg_words * 0.05, 0.8, 3.5), 1)
    longest_pause = round(_clamp(avg_pause + 1.7 + filler_count * 0.08, 1.6, 6.2), 1)
    avg_response = round(_clamp(1.5 + avg_words * 0.12, 1.2, 9.0), 1)
    total_speaking = round(total_words / 2.4, 1)

    return AudioSignals(
        speaking_pace_wpm=speaking_pace,
        pause_count=pause_count,
        avg_pause_duration_s=avg_pause,
        longest_pause_s=longest_pause,
        filler_word_count=filler_count,
        interruption_count=interruption_count,
        avg_response_time_s=avg_response,
        total_speaking_time_s=total_speaking,
    )


def _build_video_signals(audio_signals: AudioSignals, history: list[dict[str, str]], mode: str) -> VideoSignals | None:
    if mode != "video":
        return None

    user_turns = [item["text"] for item in history if item["speaker"] == "user"]
    question_ratio = (
        sum(1 for turn in user_turns if "?" in turn) / max(1, len(user_turns))
        if user_turns
        else 0.0
    )
    eye_contact = _clamp(0.86 - abs(audio_signals.speaking_pace_wpm - 145) / 220 - audio_signals.interruption_count * 0.04, 0.42, 0.94)
    stability = _clamp(0.88 - audio_signals.filler_word_count * 0.015, 0.48, 0.96)
    engagement = _clamp(0.66 + question_ratio * 0.18 + len(user_turns) * 0.015, 0.52, 0.95)

    return VideoSignals(
        eye_contact_estimate=round(eye_contact, 2),
        face_centered=audio_signals.interruption_count < 4,
        head_movement_stability=round(stability, 2),
        facial_engagement_estimate=round(engagement, 2),
        speaking_pace_wpm=audio_signals.speaking_pace_wpm,
        interruption_count=audio_signals.interruption_count,
        filler_word_count=audio_signals.filler_word_count,
        privacy_notice=PRIVACY_NOTICE,
    )


def _build_live_coaching(
    history: list[dict[str, str]],
    persona: Any,
    audio_signals: AudioSignals,
    latest_reply: str,
    latest_user_message: str,
) -> LiveCoaching:
    user_turns = [item["text"] for item in history if item["speaker"] == "user"]
    risk_cue_count = sum(1 for item in history if item["speaker"] == "patient" and _is_critical(item["text"], persona.hidden_red_flag))
    avg_words = sum(len(turn.split()) for turn in user_turns) / max(1, len(user_turns)) if user_turns else 0
    empathy_hits = sum(1 for turn in user_turns if any(token in turn.lower() for token in ("sorry", "understand", "help", "hear", "thank", "glad")))
    clarity_estimate = int(_clamp(84 - abs(avg_words - 14) * 2.6 - audio_signals.filler_word_count * 1.5, 42, 96))
    empathy_estimate = int(_clamp(52 + empathy_hits * 14 - audio_signals.interruption_count * 5, 38, 97))
    turn_taking_estimate = int(_clamp(78 - audio_signals.interruption_count * 8 + len(user_turns) * 3, 35, 96))

    strengths: list[str] = []
    warnings: list[str] = []
    if user_turns:
        if empathy_estimate >= 72:
            strengths.append("You are signaling empathy clearly instead of jumping straight into task mode.")
        if clarity_estimate >= 72:
            strengths.append("Your turns are staying compact enough for the persona to follow.")
        if "?" in latest_user_message:
            strengths.append("You used a question to keep the persona moving instead of over-explaining.")
    else:
        strengths.append("Open by grounding the caller and clarifying the immediate concern.")

    if risk_cue_count:
        warnings.append("A risk cue is active. Shift from routine guidance to safety-focused triage.")
    if audio_signals.speaking_pace_wpm > 168:
        warnings.append("Your pace is trending fast. Slow down and separate the next step into one sentence at a time.")
    if audio_signals.filler_word_count >= 4:
        warnings.append("Filler words are stacking up. Pause before the next question to sound more deliberate.")
    if not warnings:
        warnings.append("Keep pressure on the main issue. Avoid wandering into extra detail before you resolve the goal.")

    if risk_cue_count:
        next_best_action = "Acknowledge the symptom directly, ask one brief severity question, then escalate or route to urgent help."
    elif latest_reply.endswith("?") or "?" in latest_reply:
        next_best_action = "Answer the persona's question clearly, then confirm the safest next step in plain language."
    else:
        next_best_action = "Use your next turn to clarify one missing detail and then summarize the plan."

    suggested_response = (
        f"I want to make sure I understood you: {latest_reply[:110].rstrip('.!?')}. "
        "Let me ask one quick question so I can guide the next step safely."
    )

    summary = (
        f"{len(user_turns)} trainee turns, {risk_cue_count} active risk cue"
        f"{'' if risk_cue_count == 1 else 's'}, pace {audio_signals.speaking_pace_wpm} wpm."
    )

    return LiveCoaching(
        summary=summary,
        next_best_action=next_best_action,
        suggested_response=suggested_response,
        strengths=strengths[:3],
        warnings=warnings[:3],
        clarity_estimate=clarity_estimate,
        empathy_estimate=empathy_estimate,
        turn_taking_estimate=turn_taking_estimate,
        risk_cue_count=risk_cue_count,
    )


async def _generate_reply(persona: Any, scenario: dict[str, Any] | None, mode: str, history: list[dict[str, str]], user_message: str) -> dict[str, Any]:
    if not settings.openai_api_key and not settings.anthropic_api_key:
        return {"text": mock_service.get_next_turn("demo", len(history), user_message).entry.text, "should_end_call": False}

    history_lines = "\n".join(f"{item['speaker'].upper()}: {item['text']}" for item in history[-12:])
    scenario_text = ""
    if scenario:
        scenario_text = (
            f"Scenario title: {scenario.get('title', '')}\n"
            f"Scenario objective: {scenario.get('objective', '')}\n"
            f"Success condition: {scenario.get('success_condition', '')}\n"
        )

    user_prompt = (
        f"Mode: {mode}\n"
        f"Persona name: {persona.name}\n"
        f"Persona role: {persona.role}\n"
        f"Persona mood: {persona.mood}\n"
        f"Persona traits: {', '.join(persona.traits)}\n"
        f"Persona goal: {persona.goal}\n"
        f"Persona behavior: {persona.behavior}\n"
        f"Voice style: {persona.voice_style}\n"
        f"Hidden red flag: {persona.hidden_red_flag or 'none'}\n"
        f"{scenario_text}\n"
        f"Conversation so far:\n{history_lines or 'No prior turns.'}\n\n"
        f"Latest trainee message: {user_message or '[start the conversation with the persona opening line]'}"
    )

    try:
        if settings.openai_api_key:
            payload = await _openai_json(SIMULATION_SYSTEM_PROMPT, user_prompt)
            content = payload["choices"][0]["message"]["content"]
            return json.loads(content)
        payload = await _anthropic_json(SIMULATION_SYSTEM_PROMPT, user_prompt)
        text_blocks = [block.get("text", "") for block in payload.get("content", []) if block.get("type") == "text"]
        return json.loads("\n".join(text_blocks))
    except Exception:
        if not history:
            return {"text": persona.opening_line, "should_end_call": False}
        sample_lines = persona.sample_lines or [persona.opening_line]
        idx = min(len(history) // 2, len(sample_lines) - 1)
        return {"text": sample_lines[idx], "should_end_call": False}


async def respond(
    session_id: str,
    turn_index: int,
    user_message: str,
    persona_id: str | None = None,
    scenario_id: str | None = None,
    mode: str | None = None,
) -> SimulationTurn:
    session = _get_session(session_id)
    persona = persona_service.get_persona(persona_id) if persona_id else None
    if not persona:
        persona = mock_service.get_persona("", "Healthcare")
    scenario = persona_service.SCENARIO_STORE.get(scenario_id) if scenario_id else None
    chosen_mode = mode or "video"

    if user_message.strip():
        session["history"].append({"speaker": "user", "text": user_message.strip()})

    if not session["history"]:
        reply_text = persona.opening_line
        should_end_call = False
    else:
        payload = await _generate_reply(persona, scenario, chosen_mode, session["history"], user_message.strip())
        reply_text = str(payload.get("text") or persona.opening_line).strip()
        should_end_call = bool(payload.get("should_end_call"))

    session["history"].append({"speaker": "patient", "text": reply_text})
    session["last_turn_index"] = turn_index
    audio_signals = _build_audio_signals(session["history"])
    video_signals = _build_video_signals(audio_signals, session["history"], chosen_mode)
    coaching = _build_live_coaching(session["history"], persona, audio_signals, reply_text, user_message.strip())

    return SimulationTurn(
        session_id=session_id,
        turn_index=turn_index,
        entry=TranscriptEntry(
            speaker="patient",
            timestamp="",
            text=reply_text,
            is_critical=_is_critical(reply_text, persona.hidden_red_flag),
        ),
        call_ended=should_end_call,
        audio_signals=audio_signals,
        video_signals=video_signals,
        coaching=coaching,
    )


def get_full_transcript(session_id: str) -> list[dict[str, str]]:
    session = _get_session(session_id)
    return session["history"]
