import random
from app.models.persona import PersonaResponse
from app.models.scenario import ScenarioResponse
from app.models.rubric import RubricResponse, RubricItem
from app.models.simulation import TranscriptEntry, SimulationTurn
from app.models.signals import VideoSignals, AudioSignals, FrameAnalysisResponse, PRIVACY_NOTICE
from app.models.evaluation import (
    EvaluationReport, KeyMoment, AnnotatedTurn, CoachFeedback, MultimodalInsightItem
)

MARGARET_PERSONA = PersonaResponse(
    id="persona-margaret-001",
    name="Margaret Lewis",
    age=72,
    role="Post-discharge patient",
    mood="worried",
    traits=["polite", "hesitant", "apologetic"],
    goal="Understand new medication instructions",
    hidden_red_flag="Chest tightness — reveals only if asked about symptoms or after ~2 min",
    behavior="Apologetic, asks to repeat, easily distracted",
    voice_style="Elderly, calm, slightly anxious — light tremor",
    opening_line="Hi, I'm sorry to bother you. I was discharged yesterday and I'm confused about which pills I should take tonight.",
    avatar_preset="margaret",
    sample_lines=[
        "Hi, I'm sorry to bother you. I was discharged yesterday and I'm confused about which pills I should take tonight.",
        "Oh dear, I have so many bottles here… I'm not sure which is the water pill.",
        "They told me in the hospital but I was still groggy and I forgot to write it down.",
        "I think I took one this morning but now I'm second-guessing myself.",
        "I also feel a little tightness in my chest, but maybe I'm just nervous.",
        "Should I be worried about that? The tightness, I mean.",
        "I don't want to be a bother — should I call 911?",
        "Thank you so much, dear. You've been very patient with me.",
    ],
)

MOCK_TRANSCRIPT: list[TranscriptEntry] = [
    TranscriptEntry(speaker="patient", timestamp="00:15", text=MARGARET_PERSONA.opening_line),
    TranscriptEntry(speaker="patient", timestamp="00:52", text="Oh dear, I have so many bottles here… I'm not sure which is the water pill and which is the blood pressure one."),
    TranscriptEntry(speaker="patient", timestamp="01:30", text="They told me in the hospital but I was still groggy and I forgot to write it down."),
    TranscriptEntry(speaker="patient", timestamp="02:10", text="I think I took one this morning but now I'm second-guessing myself."),
    TranscriptEntry(speaker="patient", timestamp="02:41", text="I also feel a little tightness in my chest, but maybe I'm just nervous.", is_critical=True),
    TranscriptEntry(speaker="patient", timestamp="03:15", text="Should I be worried about that? The tightness, I mean."),
    TranscriptEntry(speaker="patient", timestamp="04:00", text="I don't want to be a bother — should I call 911?"),
    TranscriptEntry(speaker="patient", timestamp="04:50", text="Thank you so much, dear. You've been very patient with me."),
]

MOCK_SCENARIO = ScenarioResponse(
    id="scenario-postdischarge-001",
    title="Post-surgery follow-up call",
    description=(
        "Margaret was discharged 36 hours ago. She'll call confused about her medication, "
        "but her real concern (chest tightness) only surfaces if you ask the right questions."
    ),
    your_role="Care coordinator",
    duration="~5 min",
    objective="Verify identity, identify urgent concerns, escalate if needed",
    success_condition="Patient is safely escalated to clinical support",
    difficulty="Medium",
    industry="Healthcare",
)

MOCK_RUBRIC = RubricResponse(
    id="rubric-healthcare-001",
    items=[
        RubricItem(name="Identity verification", weight=10, description="Confirm patient name and date of birth"),
        RubricItem(name="Empathy", weight=18, description="Show genuine concern and acknowledge patient's feelings"),
        RubricItem(name="Question quality", weight=14, description="Ask open-ended, clarifying questions"),
        RubricItem(name="Red-flag detection", weight=20, is_hot=True, description="Identify and respond to clinical red flags"),
        RubricItem(name="Escalation handling", weight=18, is_hot=True, description="Escalate appropriately when safety is at risk"),
        RubricItem(name="Clarity of next steps", weight=10, description="Communicate clearly what will happen next"),
        RubricItem(name="Nonverbal engagement", weight=10, description="Maintain eye contact and attentive body language"),
    ],
)

MOCK_KEY_MOMENTS = [
    KeyMoment(timestamp="00:42", position_pct=0.07, type="strong", title="Strong empathy opening",
              excerpt="I can hear this has been a worrying time. Let me help you through this step by step."),
    KeyMoment(timestamp="01:18", position_pct=0.22, type="improve", title="Missed clarifying question",
              excerpt="Got it, let me know which pill you're asking about.",
              why_it_mattered="Opportunity to ask about dizziness or other symptoms was missed."),
    KeyMoment(timestamp="02:05", position_pct=0.36, type="risk", title="Dizziness mention missed",
              excerpt="I've been a little dizzy, but I think it's just from the surgery.",
              why_it_mattered="Dizziness after surgery warrants follow-up. It was not explored."),
    KeyMoment(timestamp="02:41", position_pct=0.47, type="risk", title="Escalation opportunity missed",
              excerpt="I also feel a little tightness in my chest, but maybe I'm just nervous.",
              why_it_mattered=(
                  "Chest tightness after surgery is a red flag for cardiac or pulmonary complications. "
                  "The conversation should have shifted to immediate triage."
              ),
              better_response=(
                  "Because you mentioned chest tightness after surgery, I need to connect you with urgent "
                  "clinical support right away. I'm going to stay with you while we get the right person involved."
              ),
              score_impact=-12),
    KeyMoment(timestamp="03:20", position_pct=0.58, type="question", title="Good clarifying question",
              excerpt="Can you tell me where the tightness was and when it started?"),
    KeyMoment(timestamp="04:30", position_pct=0.80, type="strong", title="Clear next steps communicated",
              excerpt="I'm going to connect you with our clinical team right now. Stay on the line."),
]

MOCK_ANNOTATED_TRANSCRIPT = [
    AnnotatedTurn(speaker="You", timestamp="00:42",
                  text="I can hear this has been a worrying time. Let me help you through this step by step.",
                  tag="strong", tag_label="Strong empathy"),
    AnnotatedTurn(speaker="Margaret", timestamp="01:05",
                  text="I just got home yesterday and they gave me so many bottles…"),
    AnnotatedTurn(speaker="You", timestamp="01:18",
                  text="Got it, let me know which pill you're asking about.",
                  tag="improve", tag_label="Missed clarifying question — was she dizzy?"),
    AnnotatedTurn(speaker="Margaret", timestamp="02:05",
                  text="I've been a little dizzy, but I think it's just from the surgery."),
    AnnotatedTurn(speaker="Margaret", timestamp="02:41",
                  text="…and I felt this tightness in my chest, but I wasn't sure if it was from the surgery.",
                  tag="risk", tag_label="Critical red flag mentioned"),
    AnnotatedTurn(speaker="You", timestamp="02:45",
                  text="Okay, and were you taking the white pill in the morning or evening?",
                  tag="risk", tag_label="Missed escalation — continued with medication question"),
    AnnotatedTurn(speaker="You", timestamp="03:20",
                  text="Can you tell me where the tightness was and when it started?",
                  tag="question", tag_label="Good clarifying question (slightly late)"),
]

MOCK_MULTIMODAL_INSIGHTS = [
    MultimodalInsightItem(label="Eye-contact estimate", value="62%", note="steady", tone="warn"),
    MultimodalInsightItem(label="Speaking pace", value="164 wpm", note="slightly fast", tone="warn"),
    MultimodalInsightItem(label="Facial engagement", value="consistent", tone="ok"),
    MultimodalInsightItem(label="Camera presence", value="centered", tone="ok"),
    MultimodalInsightItem(label="Filler words", value="12", note="um, like, you know", tone="warn"),
    MultimodalInsightItem(label="Interruptions", value="3", tone="warn"),
    MultimodalInsightItem(label="Avg response", value="18s", tone="ok"),
    MultimodalInsightItem(label="Longest pause", value="4.2s", tone="ok"),
]

MOCK_COACH_FEEDBACK = CoachFeedback(
    did_well=(
        "Strong empathy, calm tone throughout, and a respectful pace that suited an older patient. "
        "Your opening line set a warm anchor. You asked clarifying questions and avoided rushing."
    ),
    missed=(
        "When Margaret mentioned chest tightness at 02:41, you continued with medication questions "
        "for 39 seconds instead of escalating immediately. This is the highest-impact moment of the call."
    ),
    try_next=(
        "3-minute red-flag escalation drill · A harder variant where Margaret reveals symptoms "
        "earlier and tries to deflect."
    ),
    next_drill_title="Red-flag escalation drill (Hard)",
)

MOCK_NEXT_PRACTICE = [
    {"persona": "margaret", "name": "Red-flag escalation drill", "difficulty": "Hard",
     "description": "Margaret reveals symptoms earlier and deflects.", "why": "Lowest score: escalation 58"},
    {"persona": "aanya", "name": "Refund · interrupting customer", "difficulty": "Hard",
     "description": "Customer talks over you constantly.", "why": "Turn-taking has plateaued"},
    {"persona": "james", "name": "Behavioral · STAR specificity", "difficulty": "Medium",
     "description": "Recruiter pushes for concrete examples.", "why": "Strongest growth area"},
]

MOCK_REPORT = EvaluationReport(
    session_id="session-demo-001",
    overall_score=78,
    skill_scores={
        "Empathy": 86,
        "Clarity": 80,
        "Active listening": 74,
        "Safety / escalation": 58,
        "Professionalism": 84,
        "Turn-taking": 76,
        "Video presence": 71,
        "Pace control": 68,
    },
    key_moments=MOCK_KEY_MOMENTS,
    annotated_transcript=MOCK_ANNOTATED_TRANSCRIPT,
    multimodal_insights=MOCK_MULTIMODAL_INSIGHTS,
    coach_feedback=MOCK_COACH_FEEDBACK,
    next_practice=MOCK_NEXT_PRACTICE,
)

MOCK_AGENT_LOG = [
    {"agent": "Persona Generator", "color": "#5EEAD4",
     "message": "Anchored on 'elderly, post-discharge, medication confusion.' Set politeness high, attention variable."},
    {"agent": "Scenario Builder", "color": "#93B4FF",
     "message": "Added latent red flag: chest tightness, revealed after symptom probe OR ~2 min latency."},
    {"agent": "Rubric Agent", "color": "#B5ACFD",
     "message": "Boosted weights on red-flag detection & escalation (high risk scenario)."},
    {"agent": "Persona Generator", "color": "#5EEAD4",
     "message": "Voice: female, ~70-75, calm pace 130 wpm, slight tremor on first syllables."},
]


def get_persona(prompt: str, industry: str) -> PersonaResponse:
    return MARGARET_PERSONA


def get_scenario(persona_id: str, industry: str) -> ScenarioResponse:
    return MOCK_SCENARIO


def get_rubric(scenario_id: str, industry: str, focus: list[str]) -> RubricResponse:
    return MOCK_RUBRIC


def get_next_turn(session_id: str, turn_index: int, user_message: str) -> SimulationTurn:
    entries = MOCK_TRANSCRIPT
    idx = min(turn_index, len(entries) - 1)
    entry = entries[idx]
    call_ended = idx >= len(entries) - 1
    return SimulationTurn(
        session_id=session_id,
        turn_index=idx,
        entry=entry,
        call_ended=call_ended,
    )


def get_full_transcript() -> list[dict]:
    return [e.model_dump() for e in MOCK_TRANSCRIPT]


def get_mock_frame_signals(session_id: str, frame_index: int) -> FrameAnalysisResponse:
    jitter = random.uniform(-0.05, 0.05)
    signals = VideoSignals(
        eye_contact_estimate=max(0.3, min(0.95, 0.62 + jitter)),
        face_centered=True,
        head_movement_stability=max(0.5, min(1.0, 0.78 + jitter * 0.5)),
        facial_engagement_estimate=max(0.6, min(1.0, 0.84 + jitter * 0.3)),
        speaking_pace_wpm=max(120, min(220, 164 + int(jitter * 30))),
        interruption_count=3,
        filler_word_count=max(0, 12 + int(jitter * 5)),
    )
    return FrameAnalysisResponse(signals=signals, frame_index=frame_index, session_id=session_id)


def get_mock_video_summary() -> VideoSignals:
    return VideoSignals()


def get_mock_audio_summary() -> AudioSignals:
    return AudioSignals()


def get_report(session_id: str) -> EvaluationReport:
    report = MOCK_REPORT.model_copy()
    report.session_id = session_id
    return report


def get_agent_log() -> list[dict]:
    return MOCK_AGENT_LOG
