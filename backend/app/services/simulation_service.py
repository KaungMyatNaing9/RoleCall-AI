import asyncio
import json
from typing import Any
from urllib import request

from fastapi import HTTPException

from app.config import settings
from app.models.signals import AudioSignals, VideoSignals, PRIVACY_NOTICE
from app.models.simulation import LiveCoaching, SimulationTurn, TranscriptEntry
from app.prompts.simulation_prompt import (
    SIMULATION_AGENT_SYSTEM_PROMPT,
    build_simulation_agent_prompt,
)
from app.services import audio_signal_service, persona_service, video_signal_service


SESSION_STORE: dict[str, dict[str, Any]] = {}

INDUSTRY_ESCALATION_POLICIES: dict[str, dict[str, Any]] = {
    "healthcare": {
        "threshold": "Escalate when symptoms suggest urgent medical risk, medication danger, or immediate safety concerns.",
        "persona_behavior": "Once the trainee gives a safe escalation plan, cooperate and ask one practical follow-up at most.",
        "trigger_terms": ("chest", "shortness of breath", "dizzy", "bleeding", "fainted", "911", "urgent"),
    },
    "customer service": {
        "threshold": "Escalate when the trainee offers a supervisor, exception path, refund approval, or safety/compliance routing.",
        "persona_behavior": "Push back once if the trainee is vague, but accept a clear escalation or refund path.",
        "trigger_terms": ("supervisor", "manager", "refund", "escalate", "case number", "policy exception"),
    },
    "sales": {
        "threshold": "Escalate when legal, security, procurement, or technical ownership must step in, or when the deal is clearly not a fit.",
        "persona_behavior": "Test for confidence and objection handling before accepting a next meeting or handoff.",
        "trigger_terms": ("procurement", "legal", "security", "technical", "next meeting", "follow up"),
    },
    "hr/interviews": {
        "threshold": "Escalate when policy, bias, discrimination, candidate safety, or formal HR review is needed.",
        "persona_behavior": "Stay realistic and process-focused once the trainee proposes a compliant next step.",
        "trigger_terms": ("policy", "hr", "recruiter", "formal review", "report", "escalate"),
    },
    "education": {
        "threshold": "Escalate when student safety, mandated reporting, or administrator involvement is required.",
        "persona_behavior": "Ask for reassurance, then accept a clear safety or school-support plan.",
        "trigger_terms": ("principal", "counselor", "safety", "mandated", "report", "guardian"),
    },
    "finance": {
        "threshold": "Escalate when fraud, account compromise, identity risk, or urgent financial loss is present.",
        "persona_behavior": "Stay concerned until the trainee gives a concrete protection plan or routes to the correct fraud team.",
        "trigger_terms": ("fraud", "freeze", "lock", "security", "identity", "bank", "urgent"),
    },
    "hospitality": {
        "threshold": "Escalate when guest safety, security, compensation approval, or management involvement is needed.",
        "persona_behavior": "Remain dissatisfied until the trainee proposes a concrete fix, manager, or safety action.",
        "trigger_terms": ("manager", "security", "unsafe", "compensation", "refund", "room move"),
    },
    "custom": {
        "threshold": "Escalate when the scenario shifts beyond routine handling and requires a higher-authority or safety decision.",
        "persona_behavior": "Accept escalation only after the trainee explains why it is necessary.",
        "trigger_terms": ("urgent", "manager", "supervisor", "safety", "escalate"),
    },
}

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
    return SESSION_STORE.setdefault(
        session_id,
        {
            "history": [],
            "last_turn_index": -1,
            "phase": "opening",
            "phase_history": [],
            "scenario_state": {
                "revealed_facts": [],
                "trainee_actions": [],
                "pending_goals": [],
                "safety_status": "not_assessed",
                "closure_ready": False,
            },
        },
    )


def _count_filler_words(text: str) -> int:
    lower = f" {text.lower()} "
    total = 0
    for phrase in (" um ", " uh ", " like ", " you know ", " actually ", " basically ", " sort of ", " kind of "):
        total += lower.count(phrase)
    return total


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _build_audio_signals(history: list[dict[str, str]]) -> AudioSignals:
    return audio_signal_service.analyze_history(history)


def _build_video_signals(session_id: str, audio_signals: AudioSignals, history: list[dict[str, str]], mode: str) -> VideoSignals | None:
    return video_signal_service.get_live_summary(session_id, mode, audio_signals)


def _did_user_escalate(history: list[dict[str, str]]) -> bool:
    escalation_terms = ("911", "urgent", "emergency", "immediately", "doctor", "nurse", "go to", "call")
    return any(
        turn["speaker"] == "user" and any(term in turn["text"].lower() for term in escalation_terms)
        for turn in history
    )


def _did_user_summarize(history: list[dict[str, str]]) -> bool:
    summary_terms = ("let me summarize", "next step", "here's what we'll do", "to make sure", "just to confirm")
    return any(
        turn["speaker"] == "user" and any(term in turn["text"].lower() for term in summary_terms)
        for turn in history
    )


def _normalize_industry(industry: str | None) -> str:
    value = (industry or "custom").strip().lower()
    return value if value in INDUSTRY_ESCALATION_POLICIES else "custom"


def _industry_policy_text(industry: str | None) -> str:
    policy = INDUSTRY_ESCALATION_POLICIES[_normalize_industry(industry)]
    return (
        f"Escalation threshold: {policy['threshold']}\n"
        f"Persona behavior after escalation: {policy['persona_behavior']}\n"
        f"Key trigger terms: {', '.join(policy['trigger_terms'])}"
    )


def _extract_revealed_facts(history: list[dict[str, str]], persona: Any, scenario: dict[str, Any] | None) -> list[str]:
    facts: list[str] = []
    hidden_flag = (getattr(persona, "hidden_red_flag", "") or "").strip()
    if hidden_flag:
        for turn in history:
            if turn["speaker"] != "user" and hidden_flag.split("—")[0].strip().lower() in turn["text"].lower():
                facts.append(f"Hidden red flag surfaced: {hidden_flag}")
                break

    scenario_terms = [
        ("medication", "Medication confusion or treatment instructions are part of the case."),
        ("refund", "Refund or compensation pressure is active."),
        ("fraud", "Fraud or account-compromise concern is active."),
        ("interview", "Interview evaluation pressure is active."),
        ("complaint", "Complaint handling pressure is active."),
    ]
    transcript_blob = " ".join(turn["text"].lower() for turn in history if turn["speaker"] != "user")
    scenario_blob = " ".join(str((scenario or {}).get(key, "")).lower() for key in ("description", "objective"))
    for needle, summary in scenario_terms:
        if needle in transcript_blob or needle in scenario_blob:
            facts.append(summary)

    return list(dict.fromkeys(facts))[:6]


def _extract_trainee_actions(history: list[dict[str, str]], industry: str | None) -> list[str]:
    actions: list[str] = []
    for turn in history:
        if turn["speaker"] != "user":
            continue
        lower = turn["text"].lower()
        if "?" in turn["text"]:
            actions.append("Asked a clarifying question.")
        if any(token in lower for token in ("sorry", "understand", "hear", "glad", "help")):
            actions.append("Signaled empathy or reassurance.")
        if any(token in lower for token in ("let me summarize", "to make sure", "next step", "here's what we'll do")):
            actions.append("Summarized the plan or next step.")
        if any(token in lower for token in INDUSTRY_ESCALATION_POLICIES[_normalize_industry(industry)]["trigger_terms"]):
            actions.append("Triggered an industry-relevant escalation action.")
        if any(token in lower for token in ("name", "date of birth", "dob", "account number", "reservation")):
            actions.append("Attempted identity or case verification.")
    return list(dict.fromkeys(actions))[:8]


def _pending_goals(history: list[dict[str, str]], scenario: dict[str, Any] | None, industry: str | None) -> list[str]:
    goals: list[str] = []
    user_blob = " ".join(turn["text"].lower() for turn in history if turn["speaker"] == "user")
    objective = str((scenario or {}).get("objective", ""))
    success = str((scenario or {}).get("success_condition", ""))
    combined = f"{objective} {success}".lower()

    if any(token in combined for token in ("verify", "identity")) and not any(token in user_blob for token in ("date of birth", "dob", "name", "account", "reservation")):
        goals.append("Identity or case verification has not happened yet.")
    if any(token in combined for token in ("escalat", "urgent", "safety", "risk")) and not _did_user_escalate(history):
        goals.append("The trainee has not completed the required escalation step yet.")
    if not _did_user_summarize(history):
        goals.append("The trainee has not clearly summarized the next step yet.")
    if "?" not in user_blob:
        goals.append("The trainee still needs to ask a focused question to move discovery forward.")

    industry_key = _normalize_industry(industry)
    if industry_key == "finance" and not any(token in user_blob for token in ("freeze", "lock", "fraud team", "bank")):
        goals.append("The trainee has not given a concrete fraud-protection action yet.")
    if industry_key == "customer service" and not any(token in user_blob for token in ("refund", "manager", "supervisor", "replacement")):
        goals.append("The trainee has not proposed a concrete resolution path yet.")
    return goals[:6]


def _update_scenario_memory(session: dict[str, Any], persona: Any, scenario: dict[str, Any] | None) -> dict[str, Any]:
    state = session.setdefault("scenario_state", {})
    industry = (scenario or {}).get("industry", "custom")
    history = session["history"]
    revealed = _extract_revealed_facts(history, persona, scenario)
    actions = _extract_trainee_actions(history, industry)
    pending = _pending_goals(history, scenario, industry)
    safety_status = "escalated" if _did_user_escalate(history) else ("risk_active" if any(_is_critical(turn["text"], getattr(persona, "hidden_red_flag", None)) for turn in history if turn["speaker"] != "user") else "routine")
    closure_ready = safety_status == "escalated" and _did_user_summarize(history)

    state.update(
        {
            "revealed_facts": revealed,
            "trainee_actions": actions,
            "pending_goals": pending,
            "safety_status": safety_status,
            "closure_ready": closure_ready,
        }
    )
    return state


def _scenario_memory_text(session: dict[str, Any], scenario: dict[str, Any] | None) -> str:
    state = session.get("scenario_state", {})
    industry = (scenario or {}).get("industry", "custom")
    lines = [
        f"Industry: {industry}",
        f"Safety status: {state.get('safety_status', 'routine')}",
        f"Revealed facts: {', '.join(state.get('revealed_facts', [])) or 'none'}",
        f"Trainee actions: {', '.join(state.get('trainee_actions', [])) or 'none'}",
        f"Pending goals: {', '.join(state.get('pending_goals', [])) or 'none'}",
        f"Closure ready: {'yes' if state.get('closure_ready') else 'no'}",
    ]
    return "\n".join(lines)


def _derive_phase_state(session: dict[str, Any], persona: Any, scenario: dict[str, Any] | None) -> dict[str, Any]:
    scenario_state = _update_scenario_memory(session, persona, scenario)
    history = session["history"]
    user_turns = [turn for turn in history if turn["speaker"] == "user"]
    patient_turns = [turn for turn in history if turn["speaker"] != "user"]
    scenario_text = " ".join(
        str((scenario or {}).get(key, "")) for key in ("description", "objective", "success_condition")
    ).lower()
    risk_active = any(_is_critical(turn["text"], getattr(persona, "hidden_red_flag", None)) for turn in patient_turns)
    red_flag_revealed = risk_active or any(
        getattr(persona, "hidden_red_flag", "") and getattr(persona, "hidden_red_flag", "").split("—")[0].strip().lower() in turn["text"].lower()
        for turn in patient_turns
    )
    escalation_expected = any(token in scenario_text for token in ("risk", "urgent", "escalat", "red flag", "safety"))
    escalated = _did_user_escalate(history)
    summarized = _did_user_summarize(history)

    if not user_turns:
        phase = "opening"
        goal = "Open the interaction naturally and present the surface-level concern."
        directive = "Give the trainee enough information to start clarifying the case, but do not reveal the full hidden issue yet."
    elif risk_active and not escalated:
        phase = "risk_assessment"
        goal = "Test whether the trainee recognizes the risk cue and shifts into safer handling."
        directive = "Stay in character, keep the risk cue active, and make the trainee earn the escalation by asking focused questions."
    elif escalation_expected and escalated and not summarized:
        phase = "resolution"
        goal = "Confirm the escalation path or agreed next step."
        directive = "Cooperate if the trainee gives a safe plan, but ask one final practical question if the plan is vague."
    elif summarized or (len(user_turns) >= 5 and (not escalation_expected or escalated)):
        phase = "closing"
        goal = "Wrap the call with clarity and check whether the trainee closes confidently."
        directive = "Allow the conversation to end if the trainee summarizes clearly and addresses the main concern."
    elif len(user_turns) >= 1:
        phase = "discovery"
        goal = "Deepen the case and decide whether to reveal more of the backstory or hidden concern."
        directive = "Reveal more detail only when the trainee asks relevant questions or shows trust-building behavior."
    else:
        phase = "opening"
        goal = "Keep the opening problem in focus."
        directive = "Stay concise and slightly guarded until the trainee starts guiding the conversation."

    session["phase"] = phase
    phase_history = session.setdefault("phase_history", [])
    if not phase_history or phase_history[-1] != phase:
        phase_history.append(phase)

    closing_ready = (
        phase == "closing"
        and (scenario_state.get("closure_ready") or summarized or escalated or len(user_turns) >= 6)
        and not scenario_state.get("pending_goals")
    )
    phase_state = {
        "phase": phase,
        "goal": goal,
        "directive": directive,
        "risk_active": risk_active,
        "red_flag_revealed": red_flag_revealed,
        "closing_ready": closing_ready,
        "phase_history": phase_history[-6:],
        "scenario_memory": _scenario_memory_text(session, scenario),
        "escalation_policy": _industry_policy_text((scenario or {}).get("industry")),
    }
    scenario_state.update(phase_state)
    return scenario_state


def _build_live_coaching(
    history: list[dict[str, str]],
    persona: Any,
    audio_signals: AudioSignals,
    video_signals: VideoSignals | None,
    latest_reply: str,
    latest_user_message: str,
    phase_state: dict[str, Any],
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
        f"Phase: {phase_state['phase']}. {len(user_turns)} trainee turns, {risk_cue_count} active risk cue"
        f"{'' if risk_cue_count == 1 else 's'}, pace {audio_signals.speaking_pace_wpm} wpm."
    )
    if video_signals and video_signals.confidence >= 0.55 and video_signals.eye_contact_estimate < 0.58:
        warnings.insert(0, "Camera attention estimate dropped. Keep your face centered and finish the next question before looking away.")
    if video_signals and video_signals.confidence >= 0.55 and video_signals.head_movement_stability < 0.55:
        warnings.insert(0, "Head movement is unstable. Reset posture before giving the next instruction.")

    return LiveCoaching(
        phase=phase_state["phase"],
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


async def _generate_reply(
    persona: Any,
    scenario: dict[str, Any] | None,
    mode: str,
    history: list[dict[str, str]],
    user_message: str,
    phase_state: dict[str, Any],
) -> dict[str, Any]:
    if not settings.openai_api_key and not settings.anthropic_api_key:
        sample_lines = persona.sample_lines or [persona.opening_line]
        idx = min(len(history) // 2, len(sample_lines) - 1)
        return {"text": sample_lines[idx], "should_end_call": len(history) >= len(sample_lines) * 2}

    history_lines = "\n".join(f"{item['speaker'].upper()}: {item['text']}" for item in history[-12:])
    user_prompt = build_simulation_agent_prompt(
        persona=persona,
        scenario=scenario,
        mode=mode,
        history_lines=history_lines,
        user_message=user_message,
        phase_name=phase_state["phase"],
        phase_goal=phase_state["goal"],
        phase_directive=phase_state["directive"],
        phase_history=phase_state["phase_history"],
        risk_active=phase_state["risk_active"],
        red_flag_revealed=phase_state["red_flag_revealed"],
        closing_ready=phase_state["closing_ready"],
        scenario_memory=phase_state["scenario_memory"],
        escalation_policy=phase_state["escalation_policy"],
    )

    try:
        if settings.openai_api_key:
            payload = await _openai_json(SIMULATION_AGENT_SYSTEM_PROMPT, user_prompt)
            content = payload["choices"][0]["message"]["content"]
            return json.loads(content)
        payload = await _anthropic_json(SIMULATION_AGENT_SYSTEM_PROMPT, user_prompt)
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
    inline_persona: Any | None = None,
    inline_scenario: dict[str, Any] | None = None,
) -> SimulationTurn:
    session = _get_session(session_id)
    if not persona_id:
        raise HTTPException(status_code=400, detail="persona_id is required for simulation responses.")
    if not scenario_id:
        raise HTTPException(status_code=400, detail="scenario_id is required for simulation responses.")

    persona = persona_service.get_persona(persona_id)
    if not persona and inline_persona is not None:
        persona_service.PERSONA_STORE[inline_persona.id] = inline_persona
        persona = inline_persona
    if not persona:
        raise HTTPException(status_code=404, detail=f"Persona not found: {persona_id}")

    scenario = persona_service.SCENARIO_STORE.get(scenario_id)
    if not scenario and inline_scenario is not None:
        store_key = inline_scenario.get("id", scenario_id)
        persona_service.SCENARIO_STORE[store_key] = inline_scenario
        scenario = inline_scenario
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario not found: {scenario_id}")

    chosen_mode = mode or "video"

    if user_message.strip():
        session["history"].append({"speaker": "user", "text": user_message.strip()})

    phase_state = _derive_phase_state(session, persona, scenario)

    if not session["history"]:
        reply_text = persona.opening_line
        should_end_call = False
    else:
        payload = await _generate_reply(
            persona,
            scenario,
            chosen_mode,
            session["history"],
            user_message.strip(),
            phase_state,
        )
        reply_text = str(payload.get("text") or persona.opening_line).strip()
        should_end_call = bool(payload.get("should_end_call")) or phase_state["closing_ready"]

    session["history"].append({"speaker": "patient", "text": reply_text})
    session["last_turn_index"] = turn_index
    phase_state = _derive_phase_state(session, persona, scenario)
    audio_signals = _build_audio_signals(session["history"])
    video_signals = _build_video_signals(session_id, audio_signals, session["history"], chosen_mode)
    coaching = _build_live_coaching(session["history"], persona, audio_signals, video_signals, reply_text, user_message.strip(), phase_state)

    return SimulationTurn(
        session_id=session_id,
        turn_index=turn_index,
        phase=phase_state["phase"],
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


def _normalize_speaker(speaker: str) -> str:
    normalized = speaker.strip().lower()
    if normalized in {"user", "you", "trainee", "agent"}:
        return "user"
    return "patient"


def import_transcript(session_id: str, entries: list[Any]) -> None:
    """Replace session history from client transcript (e.g. after a browser call)."""
    session = _get_session(session_id)
    history: list[dict[str, str]] = []
    for entry in entries:
        text = str(getattr(entry, "text", "") or (entry.get("text") if isinstance(entry, dict) else "")).strip()
        if not text:
            continue
        speaker_raw = str(getattr(entry, "speaker", "") or (entry.get("speaker") if isinstance(entry, dict) else "patient"))
        history.append({"speaker": _normalize_speaker(speaker_raw), "text": text})
    if history:
        session["history"] = history


def compute_session_audio_summary(session_id: str) -> tuple[AudioSignals, int]:
    """Return (AudioSignals, turn_alternation_interruption_count) for a completed session.

    Interruptions are counted by finding consecutive turns with the same speaker
    (the normal alternating pattern is user→patient→user→...; any deviation counts).
    Avg response latency is the avg_response_time_s already derived from word pacing.
    """
    history = SESSION_STORE.get(session_id, {}).get("history", [])

    ta_interruptions = sum(
        1 for i in range(1, len(history))
        if history[i]["speaker"] == history[i - 1]["speaker"]
    )

    audio = audio_signal_service.analyze_history(history)
    audio = audio.model_copy(update={"interruption_count": ta_interruptions})
    return audio, ta_interruptions


def synthesize_timestamps(history: list[dict[str, str]]) -> list[str]:
    """Return a MM:SS timestamp for every turn, estimated from word-count pacing."""
    timestamps: list[str] = []
    elapsed = 5.0
    for turn in history:
        timestamps.append(f"{int(elapsed) // 60:02d}:{int(elapsed) % 60:02d}")
        words = len(turn["text"].split())
        wpm = 118 if turn["speaker"] == "patient" else 130
        elapsed += (words / wpm) * 60 + 1.5
    return timestamps
