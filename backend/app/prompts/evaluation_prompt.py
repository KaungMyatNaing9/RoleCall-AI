from __future__ import annotations

from app.models.persona import PersonaResponse
from app.models.rubric import RubricItem
from app.models.signals import AudioSignals, VideoSignals


EVALUATION_AGENT_SYSTEM_PROMPT = """You are the Coaching Report Agent for RoleCall AI.
Return JSON only with keys:
- did_well
- missed
- try_next
- next_drill_title
- next_practice: array of 1 to 3 objects with keys name, difficulty, description, why, persona

Rules:
- Use only the evidence provided.
- Do not invent strengths if the transcript evidence is weak.
- If the trainee did not participate enough, say so directly.
- Make feedback specific, concrete, and coach-like.
- Keep each field concise and useful.
"""


def build_evaluation_agent_prompt(
    persona: PersonaResponse | None,
    scenario: dict,
    rubric_items: list[RubricItem],
    history: list[dict[str, str]],
    skill_scores: dict[str, int],
    audio: AudioSignals,
    video_signals: VideoSignals | None,
    mode: str,
) -> str:
    persona_name = persona.name if persona else "the persona"
    rubric_lines = "\n".join(
        f"- {item.name} ({item.weight}%): score {skill_scores.get(item.name, 0)}"
        for item in rubric_items
    )
    transcript_lines = "\n".join(
        f"{turn['speaker'].upper()}: {turn['text']}"
        for turn in history[-16:]
    )
    video_lines = "No video signal summary."
    if mode == "video" and video_signals:
        video_lines = (
            f"Eye-contact estimate: {round(video_signals.eye_contact_estimate * 100)}%\n"
            f"Face centered: {video_signals.face_centered}\n"
            f"Head movement stability: {round(video_signals.head_movement_stability * 100)}%\n"
            f"Facial engagement estimate: {round(video_signals.facial_engagement_estimate * 100)}%"
        )

    return (
        f"Persona: {persona_name}\n"
        f"Industry: {scenario.get('industry', 'Healthcare')}\n"
        f"Difficulty: {scenario.get('difficulty', 'Medium')}\n"
        f"Mode: {mode}\n"
        f"Scenario objective: {scenario.get('objective', '')}\n"
        f"Scenario success condition: {scenario.get('success_condition', '')}\n\n"
        f"Rubric and scores:\n{rubric_lines}\n\n"
        f"Audio summary:\n"
        f"- Speaking pace: {audio.speaking_pace_wpm} wpm\n"
        f"- Pause count: {audio.pause_count}\n"
        f"- Filler word count: {audio.filler_word_count}\n"
        f"- Interruption count: {audio.interruption_count}\n"
        f"- Average response time: {audio.avg_response_time_s}s\n\n"
        f"Video summary:\n{video_lines}\n\n"
        f"Transcript:\n{transcript_lines or 'No transcript evidence.'}\n"
    )
