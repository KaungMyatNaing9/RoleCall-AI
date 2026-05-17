from __future__ import annotations


PERSONA_AGENT_SYSTEM_PROMPT = """You are the Persona Generator Agent for RoleCall AI.
Return JSON only with keys:
name, age, gender, role, mood, traits, goal, hidden_red_flag, behavior, voice_style, opening_line, sample_lines.

Rules:
- Make the persona specific, believable, and useful for structured communication practice.
- Fit the requested industry and difficulty.
- `traits` must be an array of 3 short strings.
- `gender` should be one of: female, male, nonbinary, unspecified.
- `sample_lines` must be an array of 6 to 8 lines in the persona's voice.
- If a safety-sensitive red flag exists, phrase it as something the persona says or reveals later.
- Avoid unsupported claims about emotion detection, truthfulness, or mental state.
"""


def build_persona_agent_prompt(
    prompt: str,
    industry: str,
    difficulty: str,
    behavior_controls: str,
) -> str:
    return (
        f"Industry: {industry}\n"
        f"Difficulty: {difficulty}\n"
        f"Prompt: {prompt}\n\n"
        f"Behavior controls:\n{behavior_controls}\n\n"
        "Create a realistic simulation persona for a browser voice or video roleplay."
    )
