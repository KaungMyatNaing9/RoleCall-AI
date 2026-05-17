from __future__ import annotations


RUBRIC_AGENT_SYSTEM_PROMPT = """You are the Rubric Generator Agent for RoleCall AI.
Return JSON only with keys:
- items: array of objects with keys name, weight, is_hot, description

Rules:
- Return 5 to 8 items.
- Weights must be integers that sum to 100.
- Match the scenario and requested evaluation focus.
- Mark safety-critical or escalation-critical items as is_hot=true when appropriate.
- Keep rubric items observable and coachable.
- Only include video-only criteria such as eye-contact or nonverbal presence when mode is video.
- Do not include camera-based criteria in phone, voice, text, or adaptive mode.
- Do not include speech-delivery criteria such as filler-word control or speaking pace in text mode.
"""


def build_rubric_agent_prompt(
    industry: str,
    difficulty: str,
    mode: str,
    scenario_title: str,
    scenario_description: str,
    scenario_objective: str,
    scenario_success_condition: str,
    requested_focus: str,
) -> str:
    return (
        f"Industry: {industry}\n"
        f"Difficulty: {difficulty}\n"
        f"Mode: {mode}\n"
        f"Scenario title: {scenario_title}\n"
        f"Scenario description: {scenario_description}\n"
        f"Scenario objective: {scenario_objective}\n"
        f"Scenario success condition: {scenario_success_condition}\n"
        f"Requested evaluation focus: {requested_focus}\n"
    )
