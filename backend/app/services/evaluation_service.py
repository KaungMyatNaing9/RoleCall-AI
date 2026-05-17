from __future__ import annotations

from typing import Any

from app.models.evaluation import (
    AnnotatedTurn,
    CoachFeedback,
    EvaluationReport,
    KeyMoment,
    ModalityContribution,
    MultimodalInsightItem,
)
from app.models.rubric import RubricItem
from app.prompts.evaluation_prompt import (
    EVALUATION_AGENT_SYSTEM_PROMPT,
    build_evaluation_agent_prompt,
)
from app.services import persona_service, rubric_service, simulation_service, video_signal_service


def _clamp_score(value: float) -> int:
    return max(0, min(96, round(value)))


def _normalize_name(name: str) -> str:
    return name.strip().lower()


def _contains_any(text: str, terms: tuple[str, ...]) -> bool:
    return any(term in text for term in terms)


def _user_turns(history: list[dict[str, str]]) -> list[dict[str, str]]:
    return [turn for turn in history if turn["speaker"] == "user"]


def _patient_turns(history: list[dict[str, str]]) -> list[dict[str, str]]:
    return [turn for turn in history if turn["speaker"] != "user"]


def _total_words(turns: list[dict[str, str]]) -> int:
    return sum(len(turn["text"].split()) for turn in turns)


def _participation_profile(history: list[dict[str, str]]) -> dict[str, Any]:
    user_turns = _user_turns(history)
    patient_turns = _patient_turns(history)
    user_words = _total_words(user_turns)
    patient_words = _total_words(patient_turns)
    return {
        "user_turns": user_turns,
        "patient_turns": patient_turns,
        "user_turn_count": len(user_turns),
        "patient_turn_count": len(patient_turns),
        "user_word_count": user_words,
        "patient_word_count": patient_words,
        "is_empty": len(history) == 0,
        "is_no_participation": len(user_turns) == 0 or user_words == 0,
        "is_too_short": len(user_turns) < 2 or user_words < 20,
        "is_low_evidence": len(user_turns) < 3 or user_words < 40,
    }


def _count_matching(turns: list[dict[str, str]], keywords: tuple[str, ...]) -> int:
    total = 0
    for turn in turns:
        lower = turn["text"].lower()
        if any(keyword in lower for keyword in keywords):
            total += 1
    return total


def _did_escalate_after_risk(history: list[dict[str, str]]) -> bool:
    risk_terms = ("chest", "shortness of breath", "dizzy", "emergency", "tightness", "pressure", "bleeding")
    escalation_terms = ("911", "urgent", "emergency", "immediately", "clinical", "doctor", "nurse", "safety")
    seen_risk = False
    for turn in history:
        lower = turn["text"].lower()
        if turn["speaker"] != "user" and any(term in lower for term in risk_terms):
            seen_risk = True
            continue
        if seen_risk and turn["speaker"] == "user" and any(term in lower for term in escalation_terms):
            return True
    return False


def _format_duration_from_history(history: list[dict[str, str]]) -> str:
    elapsed = 5.0
    for turn in history:
        words = len(turn["text"].split())
        wpm = 118 if turn["speaker"] == "patient" else 130
        elapsed += (words / wpm) * 60 + 1.5
    total_seconds = max(0, int(round(elapsed)))
    return f"{total_seconds // 60:02d}:{total_seconds % 60:02d}"


def _pace_score(audio) -> float:
    pace = max(0, audio.speaking_pace_wpm)
    if pace == 0:
        return 18
    if 125 <= pace <= 160:
        return 86
    if 115 <= pace < 125 or 160 < pace <= 172:
        return 74
    if 105 <= pace < 115 or 172 < pace <= 182:
        return 58
    return 34


def _filler_score(audio) -> float:
    count = max(0, audio.filler_word_count)
    if count == 0:
        return 88
    if count <= 2:
        return 78
    if count <= 5:
        return 62
    if count <= 8:
        return 46
    return 28


def _turn_taking_score(audio, turn_balance_penalty: int) -> float:
    interruptions = max(0, audio.interruption_count)
    score = 84 - interruptions * 10 - turn_balance_penalty
    return max(18, score)


def _video_nonverbal_score(video_signals) -> float:
    centered = 1.0 if video_signals.face_centered else 0.55
    raw = (
        video_signals.facial_engagement_estimate * 0.35
        + video_signals.head_movement_stability * 0.35
        + centered * 0.2
        + video_signals.confidence * 0.1
    )
    return 16 + raw * 78


def _video_eye_contact_score(video_signals) -> float:
    raw = video_signals.eye_contact_estimate * 0.85 + video_signals.confidence * 0.15
    return 16 + raw * 78


def _score_rubric_items(
    history: list[dict[str, str]],
    rubric_items: list[RubricItem],
    audio,
    video_signals,
    mode: str,
) -> tuple[dict[str, int], set[str]]:
    profile = _participation_profile(history)
    user_turns = profile["user_turns"]
    patient_turns = profile["patient_turns"]
    all_user_text = " ".join(turn["text"] for turn in user_turns)
    question_count = sum(turn["text"].count("?") for turn in user_turns)
    empathy_hits = _count_matching(user_turns, ("sorry", "understand", "hear", "help", "thank you", "glad"))
    summary_hits = _count_matching(user_turns, ("so what i'm hearing", "to make sure", "let me summarize", "next step", "here's what we'll do"))
    escalation_hit = _did_escalate_after_risk(history)
    reflection_hits = 0
    for patient_turn in patient_turns:
        head_terms = patient_turn["text"].lower().split()[:4]
        if any(
            any(term in user_turn["text"].lower() for term in head_terms)
            for user_turn in user_turns
        ):
            reflection_hits += 1
    turn_balance_penalty = max(0, abs(len(user_turns) - len(patient_turns)) - 1) * 3

    if profile["is_no_participation"]:
        return {item.name: 5 for item in rubric_items}

    evidence_penalty = 0
    if profile["is_too_short"]:
        evidence_penalty = 28
    elif profile["is_low_evidence"]:
        evidence_penalty = 14

    scores: dict[str, int] = {}
    skipped_items: set[str] = set()
    for item in rubric_items:
        key = _normalize_name(item.name)
        score = 42.0
        if "empathy" in key:
            score = 18 + empathy_hits * 16
        elif "clarity" in key or "next steps" in key:
            avg_words = len(all_user_text.split()) / max(1, len(user_turns))
            score = 26 + (36 - abs(avg_words - 15) * 2.0) + summary_hits * 10
        elif "active listening" in key or "question quality" in key or "discovery" in key:
            score = 18 + min(question_count, 6) * 8 + min(reflection_hits, 4) * 6 + summary_hits * 6
        elif "escalation" in key or "safety" in key or "risk" in key:
            score = 88 if escalation_hit else 16
        elif "pace" in key:
            score = _pace_score(audio)
        elif "filler" in key:
            score = _filler_score(audio)
        elif "interruption" in key or "turn-taking" in key:
            score = _turn_taking_score(audio, turn_balance_penalty)
        elif "professional" in key or "composure" in key:
            score = 36 + min(empathy_hits, 2) * 8
        elif "nonverbal" in key or "eye-contact" in key:
            if mode != "video" or video_signals is None or video_signals.confidence <= 0:
                skipped_items.add(item.name)
                score = 50
            elif "eye-contact" in key:
                score = _video_eye_contact_score(video_signals)
            else:
                score = _video_nonverbal_score(video_signals)
        scores[item.name] = _clamp_score(score - evidence_penalty)
    return scores, skipped_items


def _overall_score(skill_scores: dict[str, int], rubric_items: list[RubricItem], skipped_items: set[str]) -> int:
    if not rubric_items:
        return 0
    weighted = 0.0
    total = 0
    for item in rubric_items:
        if item.name in skipped_items:
            continue
        score = skill_scores.get(item.name, 0)
        weighted += score * item.weight
        total += item.weight
    return _clamp_score(weighted / max(1, total))


def _build_modality_contributions(
    rubric_items: list[RubricItem],
    mode: str,
    audio,
    video_signals,
) -> list[ModalityContribution]:
    transcript_weight = 0
    audio_weight = 0
    video_weight = 0
    video_used = mode == "video" and video_signals is not None and video_signals.confidence > 0

    for item in rubric_items:
        key = _normalize_name(item.name)
        if _contains_any(key, ("nonverbal", "eye-contact")):
            if video_used:
                video_weight += item.weight
            continue
        if _contains_any(key, ("pace", "filler", "interruption", "turn-taking")):
            audio_weight += item.weight
            continue
        transcript_weight += item.weight

    items = [
        ModalityContribution(
            modality="Transcript",
            weight_pct=transcript_weight,
            used_in_scoring=transcript_weight > 0,
            note="Conversation content, questioning, clarity, empathy, and escalation behavior.",
        ),
        ModalityContribution(
            modality="Audio",
            weight_pct=audio_weight,
            used_in_scoring=audio_weight > 0,
            confidence_pct=round(audio.confidence * 100),
            note=audio.analysis_source,
        ),
        ModalityContribution(
            modality="Video",
            weight_pct=video_weight,
            used_in_scoring=video_weight > 0,
            confidence_pct=round(video_signals.confidence * 100) if video_signals else None,
            note=(
                video_signals.analysis_source
                if video_used and video_signals
                else ("Not applied in non-video mode." if mode != "video" else "No reliable frame evidence was available.")
            ),
        ),
    ]
    return items


def _build_key_moments(history: list[dict[str, str]], timestamps: list[str]) -> list[KeyMoment]:
    moments: list[KeyMoment] = []
    total = max(1, len(history) - 1)
    for index, turn in enumerate(history):
        text = turn["text"]
        lower = text.lower()
        timestamp = timestamps[index] if index < len(timestamps) else "00:00"
        pos = round(index / total, 2)

        if turn["speaker"] != "user" and any(term in lower for term in ("chest", "tightness", "dizzy", "shortness of breath", "pressure")):
            moments.append(
                KeyMoment(
                    timestamp=timestamp,
                    position_pct=pos,
                    type="risk",
                    title="Critical risk cue surfaced",
                    excerpt=text,
                    why_it_mattered="The persona introduced a possible risk signal that should change the direction of the conversation.",
                    better_response="Acknowledge the symptom directly, ask one focused safety question, and move into escalation if appropriate.",
                    score_impact=-10,
                )
            )
        elif turn["speaker"] == "user" and any(term in lower for term in ("i understand", "i hear", "i'm sorry", "let me help")):
            moments.append(
                KeyMoment(
                    timestamp=timestamp,
                    position_pct=pos,
                    type="strong",
                    title="Empathy signal landed",
                    excerpt=text,
                )
            )
        elif turn["speaker"] == "user" and any(term in lower for term in ("next step", "i'm going to", "here's what we'll do", "let me summarize")):
            moments.append(
                KeyMoment(
                    timestamp=timestamp,
                    position_pct=pos,
                    type="strong",
                    title="Clear next-step guidance",
                    excerpt=text,
                )
            )
        elif turn["speaker"] == "user" and "?" in text:
            moments.append(
                KeyMoment(
                    timestamp=timestamp,
                    position_pct=pos,
                    type="question",
                    title="Clarifying question used",
                    excerpt=text,
                )
            )
        elif turn["speaker"] == "user" and len(text.split()) <= 4:
            moments.append(
                KeyMoment(
                    timestamp=timestamp,
                    position_pct=pos,
                    type="improve",
                    title="Very short trainee turn",
                    excerpt=text,
                    why_it_mattered="Very short replies can miss a chance to reassure, summarize, or steer the conversation.",
                )
            )

    return moments[:8] or [
        KeyMoment(
            timestamp="00:10",
            position_pct=0.05,
            type="improve",
            title="Low signal session",
            excerpt="The transcript was too short to detect strong coaching moments.",
            why_it_mattered="The evaluation agent needs more conversation turns to produce richer feedback.",
        )
    ]


def _build_annotated_transcript(history: list[dict[str, str]], timestamps: list[str]) -> list[AnnotatedTurn]:
    rows: list[AnnotatedTurn] = []
    for index, turn in enumerate(history):
        text = turn["text"]
        lower = text.lower()
        tag = None
        tag_label = None
        if turn["speaker"] == "user" and any(term in lower for term in ("i understand", "i hear", "let me help", "thank you")):
            tag = "strong"
            tag_label = "Empathy"
        elif turn["speaker"] == "user" and any(term in lower for term in ("next step", "i'm going to", "let me summarize")):
            tag = "strong"
            tag_label = "Clear guidance"
        elif turn["speaker"] == "user" and "?" in text:
            tag = "question"
            tag_label = "Clarifying question"
        elif turn["speaker"] != "user" and any(term in lower for term in ("chest", "tightness", "dizzy", "pressure", "shortness of breath")):
            tag = "risk"
            tag_label = "Risk cue"

        rows.append(
            AnnotatedTurn(
                speaker="You" if turn["speaker"] == "user" else "Persona",
                timestamp=timestamps[index] if index < len(timestamps) else "00:00",
                text=text,
                tag=tag,
                tag_label=tag_label,
            )
        )
    return rows


def _multimodal_insights(audio, mode: str, video_signals) -> list[MultimodalInsightItem]:
    items = [
        MultimodalInsightItem(
            label="Speaking pace",
            value=f"{audio.speaking_pace_wpm} wpm",
            note="slow down slightly" if audio.speaking_pace_wpm > 165 else ("faster could help" if 0 < audio.speaking_pace_wpm < 115 else "controlled"),
            tone="warn" if audio.speaking_pace_wpm > 165 else "ok",
        ),
        MultimodalInsightItem(
            label="Filler words",
            value=str(audio.filler_word_count),
            note="pause before key questions" if audio.filler_word_count >= 4 else "kept fairly controlled",
            tone="warn" if audio.filler_word_count >= 4 else "ok",
        ),
        MultimodalInsightItem(
            label="Interruption count",
            value=str(audio.interruption_count),
            note="watch turn control" if audio.interruption_count >= 3 else None,
            tone="warn" if audio.interruption_count >= 3 else "ok",
        ),
        MultimodalInsightItem(
            label="Avg response latency",
            value=f"{audio.avg_response_time_s}s",
            tone="ok",
        ),
        MultimodalInsightItem(
            label="Audio evidence confidence",
            value=f"{round(audio.confidence * 100)}%",
            note=audio.analysis_source,
            tone="warn" if audio.confidence < 0.45 else "ok",
        ),
    ]
    if mode == "video" and video_signals:
        items.insert(
            0,
            MultimodalInsightItem(
                label="Eye-contact estimate",
                value=f"{round(video_signals.eye_contact_estimate * 100)}%",
                note=f"coaching estimate · {video_signals.analysis_source}",
                tone="warn" if video_signals.eye_contact_estimate < 0.6 else "ok",
            )
        )
        items.insert(
            1,
            MultimodalInsightItem(
                label="Video evidence confidence",
                value=f"{round(video_signals.confidence * 100)}%",
                note="higher only when frame analysis is available",
                tone="warn" if video_signals.confidence < 0.45 else "ok",
            )
        )
        items.insert(
            2,
            MultimodalInsightItem(
                label="Face-centered estimate",
                value="Centered" if video_signals.face_centered else "Off-center at times",
                note="camera framing stability proxy",
                tone="ok" if video_signals.face_centered else "warn",
            )
        )
        items.insert(
            3,
            MultimodalInsightItem(
                label="Head movement stability",
                value=f"{round(video_signals.head_movement_stability * 100)}%",
                note="higher can support steadier nonverbal presence",
                tone="warn" if video_signals.head_movement_stability < 0.58 else "ok",
            )
        )
    return items


def _empty_history_report(
    session_id: str,
    persona_name: str,
    industry: str,
    difficulty: str,
    mode: str,
    rubric_items: list[RubricItem],
) -> EvaluationReport:
    skill_scores = {item.name: 0 for item in rubric_items}
    return EvaluationReport(
        session_id=session_id,
        overall_score=0,
        skill_scores=skill_scores,
        key_moments=[
            KeyMoment(
                timestamp="00:00",
                position_pct=0.0,
                type="improve",
                title="No conversation captured",
                excerpt="The session ended before enough transcript data was recorded.",
                why_it_mattered="The evaluation agent needs actual conversation turns to assess communication performance.",
            )
        ],
        annotated_transcript=[],
        multimodal_insights=[
            MultimodalInsightItem(label="Transcript coverage", value="0 turns", note="No usable session transcript found.", tone="bad")
        ],
        modality_contributions=[
            ModalityContribution(modality="Transcript", weight_pct=0, used_in_scoring=False, note="No transcript evidence available."),
            ModalityContribution(modality="Audio", weight_pct=0, used_in_scoring=False, note="No session evidence available."),
            ModalityContribution(modality="Video", weight_pct=0, used_in_scoring=False, note="No session evidence available."),
        ],
        coach_feedback=CoachFeedback(
            did_well="No communication performance was captured yet.",
            missed="No transcript data was available, so performance could not be evaluated reliably.",
            try_next="Run the simulation again and keep the session open long enough to capture several turns.",
            next_drill_title="Complete-session retry",
        ),
        next_practice=[
            {
                "persona": "margaret",
                "name": "Complete-session retry",
                "difficulty": difficulty,
                "description": "Re-run the same case and capture at least a few full turns before ending.",
                "why": "Evaluation needs real transcript evidence.",
            }
        ],
        duration="00:00",
        mode=mode,
        industry=industry,
        difficulty=difficulty,
        persona_name=persona_name,
    )


def _insufficient_participation_report(
    session_id: str,
    persona_name: str,
    industry: str,
    difficulty: str,
    mode: str,
    rubric_items: list[RubricItem],
    history: list[dict[str, str]],
    reason: str,
    score: int,
) -> EvaluationReport:
    skill_scores = {item.name: score for item in rubric_items}
    timestamps = simulation_service.synthesize_timestamps(history) if history else []
    annotated = _build_annotated_transcript(history, timestamps)
    moments = [
        KeyMoment(
            timestamp=timestamps[0] if timestamps else "00:00",
            position_pct=0.0,
            type="improve",
            title="Not enough trainee evidence",
            excerpt=reason,
            why_it_mattered="The evaluation agent needs several meaningful trainee turns before strengths or risks can be scored fairly.",
            better_response="Keep the session open longer and respond with complete turns that include questions, guidance, and a closing summary.",
            score_impact=0,
        )
    ]
    return EvaluationReport(
        session_id=session_id,
        overall_score=score,
        skill_scores=skill_scores,
        key_moments=moments,
        annotated_transcript=annotated,
        multimodal_insights=[
            MultimodalInsightItem(
                label="Transcript coverage",
                value=f"{len(_user_turns(history))} trainee turns",
                note=reason,
                tone="bad",
            )
        ],
        modality_contributions=[
            ModalityContribution(modality="Transcript", weight_pct=100, used_in_scoring=True, note="Limited transcript evidence only."),
            ModalityContribution(modality="Audio", weight_pct=0, used_in_scoring=False, note="Too little evidence to score fairly."),
            ModalityContribution(modality="Video", weight_pct=0, used_in_scoring=False, note="Too little evidence to score fairly."),
        ],
        coach_feedback=CoachFeedback(
            did_well="No reliable strengths can be credited yet because the trainee contribution was too limited.",
            missed=reason,
            try_next="Repeat the case and produce a fuller exchange: open the call, ask a focused question, respond to the answer, and close with a clear next step.",
            next_drill_title="Minimum evidence retry",
        ),
        next_practice=[
            {
                "persona": "baseline",
                "name": "Minimum evidence retry",
                "difficulty": difficulty,
                "description": "Repeat the same case and complete at least three meaningful trainee turns before ending.",
                "why": "Evaluation quality depends on real trainee evidence, not persona-only transcript text.",
            }
        ],
        duration=_format_duration_from_history(history) if history else "00:00",
        mode=mode,
        industry=industry,
        difficulty=difficulty,
        persona_name=persona_name,
    )


def _default_coach_feedback(
    strongest: str,
    weakest: str,
    risk_present: bool,
    low_evidence: bool,
    industry: str,
    difficulty: str,
    persona: Any,
) -> tuple[CoachFeedback, list[dict[str, Any]]]:
    if low_evidence:
        return (
            CoachFeedback(
                did_well="Only limited evidence was captured, so any apparent strengths should be treated cautiously.",
                missed="The session was too short to show stable performance across the rubric.",
                try_next="Run the scenario longer and show a full arc: opening, clarification, response to the main issue, and a closing summary.",
                next_drill_title="Low-evidence rebuild",
            ),
            [
                {
                    "persona": persona.avatar_preset if persona else "baseline",
                    "name": "Low-evidence rebuild",
                    "difficulty": difficulty,
                    "description": "Repeat a similar case and stay in the conversation long enough to show question quality, empathy, and next-step guidance.",
                    "why": "The previous session was too short to support a confident evaluation.",
                }
            ],
        )

    return (
        CoachFeedback(
            did_well=f"Your strongest demonstrated dimension in this session was {strongest.lower()}, supported by actual transcript evidence.",
            missed="A stronger close would tie the main concern, the risk level, and the next step together in one clear summary."
            if not risk_present
            else "The main improvement area is recognizing and acting on the risk cue faster once it appears.",
            try_next=f"Run another {industry} case with extra pressure on {weakest.lower()} and force a cleaner recovery.",
            next_drill_title=f"{weakest} drill",
        ),
        [
            {
                "persona": persona.avatar_preset if persona else "baseline",
                "name": f"{weakest} drill",
                "difficulty": difficulty,
                "description": f"Repeat a similar scenario with heavier emphasis on {weakest.lower()}.",
                "why": f"Weakest scoring area: {weakest}.",
            },
            {
                "persona": "james",
                "name": "Compressed questioning round",
                "difficulty": "Hard",
                "description": "Practice using shorter, more deliberate follow-up questions under pressure.",
                "why": "Improves clarity and turn-taking under load.",
            },
        ],
    )


async def _generate_agent_feedback(
    persona: Any,
    scenario: dict[str, Any],
    rubric_items: list[RubricItem],
    history: list[dict[str, str]],
    skill_scores: dict[str, int],
    audio: Any,
    video_signals: Any,
    mode: str,
    difficulty: str,
    industry: str,
    strongest: str,
    weakest: str,
    risk_present: bool,
    low_evidence: bool,
) -> tuple[CoachFeedback, list[dict[str, Any]]]:
    fallback_feedback, fallback_next = _default_coach_feedback(
        strongest=strongest,
        weakest=weakest,
        risk_present=risk_present,
        low_evidence=low_evidence,
        industry=industry,
        difficulty=difficulty,
        persona=persona,
    )

    if low_evidence or (not persona_service.settings.openai_api_key and not persona_service.settings.anthropic_api_key):
        return fallback_feedback, fallback_next

    prompt = build_evaluation_agent_prompt(
        persona=persona,
        scenario=scenario,
        rubric_items=rubric_items,
        history=history,
        skill_scores=skill_scores,
        audio=audio,
        video_signals=video_signals,
        mode=mode,
    )
    try:
        if persona_service.settings.openai_api_key:
            payload = await persona_service._openai_json(EVALUATION_AGENT_SYSTEM_PROMPT, prompt)
        else:
            payload = await persona_service._anthropic_json(EVALUATION_AGENT_SYSTEM_PROMPT, prompt)
        coach = CoachFeedback(
            did_well=str(payload.get("did_well") or fallback_feedback.did_well),
            missed=str(payload.get("missed") or fallback_feedback.missed),
            try_next=str(payload.get("try_next") or fallback_feedback.try_next),
            next_drill_title=str(payload.get("next_drill_title") or fallback_feedback.next_drill_title),
        )
        raw_next = payload.get("next_practice")
        next_practice = raw_next if isinstance(raw_next, list) and raw_next else fallback_next
        return coach, next_practice[:3]
    except Exception:
        return fallback_feedback, fallback_next


async def generate_evaluation(
    session_id: str,
    persona_id: str,
    scenario_id: str,
    rubric_id: str,
    mode: str,
) -> EvaluationReport:
    history = simulation_service.SESSION_STORE.get(session_id, {}).get("history", [])
    persona = persona_service.PERSONA_STORE.get(persona_id)
    scenario = persona_service.SCENARIO_STORE.get(scenario_id, {})
    rubric = persona_service.RUBRIC_STORE.get(rubric_id)

    persona_name = persona.name if persona else "the caller"
    industry = scenario.get("industry", "Healthcare")
    difficulty = scenario.get("difficulty", "Medium")

    if rubric:
        rubric_items = rubric.items
    else:
        generated = await rubric_service.generate_rubric(scenario_id, industry, difficulty, mode, [])
        rubric_items = generated.items
        persona_service.RUBRIC_STORE[generated.id] = generated

    if not history:
        return _empty_history_report(session_id, persona_name, industry, difficulty, mode, rubric_items)

    profile = _participation_profile(history)
    if profile["is_no_participation"]:
        return _insufficient_participation_report(
            session_id=session_id,
            persona_name=persona_name,
            industry=industry,
            difficulty=difficulty,
            mode=mode,
            rubric_items=rubric_items,
            history=history,
            reason="No trainee speech was captured, so the report cannot credit performance that never happened.",
            score=5,
        )
    if profile["is_too_short"]:
        return _insufficient_participation_report(
            session_id=session_id,
            persona_name=persona_name,
            industry=industry,
            difficulty=difficulty,
            mode=mode,
            rubric_items=rubric_items,
            history=history,
            reason="The trainee contribution was too short to support a reliable evaluation.",
            score=18,
        )

    audio, _ = simulation_service.compute_session_audio_summary(session_id)
    timestamps = simulation_service.synthesize_timestamps(history)
    video_signals = video_signal_service.summarize_session(session_id, audio) if mode == "video" else None

    skill_scores, skipped_items = _score_rubric_items(history, rubric_items, audio, video_signals, mode)
    overall = _overall_score(skill_scores, rubric_items, skipped_items)
    key_moments = _build_key_moments(history, timestamps)
    annotated = _build_annotated_transcript(history, timestamps)
    insights = _multimodal_insights(audio, mode, video_signals)
    modality_contributions = _build_modality_contributions(rubric_items, mode, audio, video_signals)

    weakest = min(skill_scores.items(), key=lambda item: item[1])[0] if skill_scores else "Escalation handling"
    strongest = max(skill_scores.items(), key=lambda item: item[1])[0] if skill_scores else "Empathy"
    risk_present = any(moment.type == "risk" for moment in key_moments)
    low_evidence = profile["is_low_evidence"]
    coach_feedback, next_practice = await _generate_agent_feedback(
        persona=persona,
        scenario=scenario,
        rubric_items=rubric_items,
        history=history,
        skill_scores=skill_scores,
        audio=audio,
        video_signals=video_signals,
        mode=mode,
        difficulty=difficulty,
        industry=industry,
        strongest=strongest,
        weakest=weakest,
        risk_present=risk_present,
        low_evidence=low_evidence,
    )

    return EvaluationReport(
        session_id=session_id,
        overall_score=overall,
        skill_scores=skill_scores,
        key_moments=key_moments,
        annotated_transcript=annotated,
        multimodal_insights=insights,
        modality_contributions=modality_contributions,
        coach_feedback=coach_feedback,
        next_practice=next_practice,
        duration=_format_duration_from_history(history),
        mode=mode,
        industry=industry,
        difficulty=difficulty,
        persona_name=persona_name,
    )
