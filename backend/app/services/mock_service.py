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

def _persona_from_prompt(prompt: str, industry: str) -> PersonaResponse:
    """Build a rough persona from the free-text prompt so the mock never ignores what the user described."""
    import re, uuid

    lower = prompt.lower()

    # --- role ---
    role_map = [
        (["teacher", "instructor", "professor", "educator"], "Teacher"),
        (["student", "pupil", "learner"], "Student"),
        (["parent", "guardian", "mother", "father", "mom", "dad"], "Parent"),
        (["patient", "discharge", "medical", "hospital"], "Patient"),
        (["customer", "buyer", "shopper", "consumer"], "Customer"),
        (["client", "account holder"], "Client"),
        (["manager", "supervisor", "boss"], "Manager"),
        (["recruiter", "hr", "interviewer", "hiring"], "Recruiter"),
        (["employee", "worker", "staff"], "Employee"),
        (["caller"], "Caller"),
    ]
    role = f"{industry} participant"
    for keywords, label in role_map:
        if any(kw in lower for kw in keywords):
            role = label
            break

    # --- mood ---
    mood_map = [
        (["angry", "furious", "rage", "outraged", "livid"], "angry"),
        (["frustrated", "annoyed", "irritated"], "angry"),
        (["worried", "anxious", "nervous", "scared", "fear"], "worried"),
        (["confused", "lost", "unsure", "uncertain"], "confused"),
        (["upset", "distressed", "sad"], "worried"),
        (["happy", "excited", "cheerful", "upbeat"], "upbeat"),
    ]
    mood = "neutral"
    for keywords, label in mood_map:
        if any(kw in lower for kw in keywords):
            mood = label
            break

    # --- age ---
    age = 38
    if any(kw in lower for kw in ("elderly", "old", "senior", "retired", "grandmother", "grandfather")):
        age = 70
    elif any(kw in lower for kw in ("young", "teen", "teenager", "college", "university", "student")):
        age = 22
    else:
        m = re.search(r"\b(\d{2})\b", prompt)
        if m:
            parsed = int(m.group(1))
            if 14 <= parsed <= 90:
                age = parsed

    # --- gender ---
    gender = "unspecified"
    if any(kw in lower for kw in ("woman", "female", "she", "her", "mother", "grandmother", "mrs", "ms")):
        gender = "female"
    elif any(kw in lower for kw in ("man", "male", "he", "his", "father", "grandfather", "mr")):
        gender = "male"

    # --- name ---
    gender_names = {
        "female": ["Sarah", "Laura", "Maria", "Jennifer"],
        "male": ["James", "David", "Michael", "Robert"],
        "unspecified": ["Alex", "Jordan", "Taylor", "Casey"],
    }
    name = gender_names[gender][hash(prompt) % 4]

    # --- hidden concern ---
    hidden_red_flag = None
    if any(kw in lower for kw in ("hidden", "secret", "concern", "red flag", "issue", "problem")):
        hidden_red_flag = "Has an underlying concern they will only reveal if directly asked or trust is established."

    # --- traits ---
    traits: list[str] = []
    if "polite" in lower or "nice" in lower:
        traits.append("polite")
    if "direct" in lower or "blunt" in lower:
        traits.append("direct")
    if "hesitant" in lower or "shy" in lower:
        traits.append("hesitant")
    if not traits:
        traits = ["direct", "realistic", "goal-oriented"]

    # --- opening line ---
    opening_line_map = {
        "Teacher": f"Hi, I have a situation with one of my students I was hoping to get some guidance on.",
        "Student": f"Hi, I'm struggling with something and wasn't sure who to talk to.",
        "Parent": f"Hello, I'm calling about my child and I have some concerns I'd like to discuss.",
        "Patient": f"Hi, I was just discharged and I'm a bit confused about what I'm supposed to do next.",
        "Customer": f"Hi, I need some help with an issue I've been having.",
        "Client": f"Hello, I have a question about my account that I really need resolved.",
        "Manager": f"Hi, I wanted to talk through a personnel situation I'm dealing with.",
        "Recruiter": f"Hello, I'm here for the interview — thanks for meeting with me.",
        "Employee": f"Hi, I wanted to raise something that's been on my mind.",
        "Caller": f"Hello, I'm calling because I need some assistance.",
    }
    opening_line = opening_line_map.get(role, f"Hi, I'm hoping you can help me with something.")

    avatar_preset = "james" if gender == "male" else ("margaret" if age >= 60 else ("aanya" if gender == "female" and age < 30 else "elena"))

    return PersonaResponse(
        id=f"persona-mock-{uuid.uuid4().hex[:8]}",
        name=name,
        age=age,
        gender=gender,
        role=role,
        mood=mood,
        traits=traits[:3],
        goal=f"Navigate this {industry.lower()} interaction and have their concern addressed.",
        hidden_red_flag=hidden_red_flag,
        behavior=f"Speaks naturally and responds to how the trainee approaches them.",
        voice_style=f"Conversational, {'slightly anxious' if mood == 'worried' else mood if mood != 'neutral' else 'measured'} tone.",
        opening_line=opening_line,
        avatar_preset=avatar_preset,
        sample_lines=[opening_line],
    )


def get_persona(prompt: str, industry: str) -> PersonaResponse:
    if prompt.strip():
        return _persona_from_prompt(prompt, industry)
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
