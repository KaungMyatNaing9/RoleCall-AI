from __future__ import annotations

from app.models.persona import PersonaResponse


SCENARIO_AGENT_SYSTEM_PROMPT = """You are the Scenario Builder Agent for RoleCall AI.
Return JSON only with keys:
title, description, your_role, duration, objective, success_condition, difficulty, industry.

Rules:
- Keep description to 2 sentences max.
- Match the provided persona and training context.
- Make success_condition concrete and observable.
- Build a scenario that exposes the trainee to meaningful communication decisions.
"""


def build_scenario_agent_prompt(
    persona: PersonaResponse,
    industry: str,
    difficulty: str,
    mode: str,
    behavior_controls: str,
) -> str:
    return (
        f"Industry: {industry}\n"
        f"Difficulty: {difficulty}\n"
        f"Mode: {mode}\n"
        f"Persona name: {persona.name}\n"
        f"Persona role: {persona.role}\n"
        f"Persona goal: {persona.goal}\n"
        f"Persona behavior: {persona.behavior}\n"
        f"Hidden red flag: {persona.hidden_red_flag or 'none'}\n"
        f"Opening line: {persona.opening_line}\n"
        f"Behavior controls:\n{behavior_controls}\n"
    )
