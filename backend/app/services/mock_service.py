import random
from app.models.persona import PersonaResponse
from app.models.scenario import ScenarioResponse
from app.models.rubric import RubricResponse, RubricItem
from app.models.simulation import LiveCoaching, TranscriptEntry, SimulationTurn
from app.models.signals import VideoSignals, AudioSignals, FrameAnalysisResponse

MARGARET_PERSONA = PersonaResponse(
    id="persona-margaret-001",
    name="Margaret Lewis",
    age=72,
    gender="female",
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
        phase="discovery" if idx < 4 else ("risk_assessment" if idx < 6 else "closing"),
        entry=entry,
        call_ended=call_ended,
        audio_signals=AudioSignals(),
        video_signals=VideoSignals(),
        coaching=LiveCoaching(
            phase="discovery" if idx < 4 else ("risk_assessment" if idx < 6 else "closing"),
            summary="Mock fallback coaching.",
            next_best_action="Ask a clarifying question and confirm the next step.",
            suggested_response="Let me clarify one detail and make sure we choose the safest next step.",
            strengths=["Mock fallback response."],
            warnings=["This session is using mock fallback behavior."],
            clarity_estimate=68,
            empathy_estimate=66,
            turn_taking_estimate=70,
            risk_cue_count=1 if idx >= 4 else 0,
        ),
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
