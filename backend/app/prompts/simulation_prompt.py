from __future__ import annotations

from typing import Any

from app.models.persona import PersonaResponse


SIMULATION_AGENT_SYSTEM_PROMPT = """You are the Simulation Agent for RoleCall AI.
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


def build_simulation_agent_prompt(
    persona: PersonaResponse,
    scenario: dict[str, Any] | None,
    mode: str,
    history_lines: str,
    user_message: str,
    phase_name: str,
    phase_goal: str,
    phase_directive: str,
    phase_history: list[str],
    risk_active: bool,
    red_flag_revealed: bool,
    closing_ready: bool,
    scenario_memory: str,
    escalation_policy: str,
) -> str:
    scenario_text = ""
    if scenario:
        scenario_text = (
            f"Scenario title: {scenario.get('title', '')}\n"
            f"Scenario objective: {scenario.get('objective', '')}\n"
            f"Success condition: {scenario.get('success_condition', '')}\n"
        )

    return (
        f"Mode: {mode}\n"
        f"Persona name: {persona.name}\n"
        f"Persona gender: {persona.gender}\n"
        f"Persona role: {persona.role}\n"
        f"Persona mood: {persona.mood}\n"
        f"Persona traits: {', '.join(persona.traits)}\n"
        f"Persona goal: {persona.goal}\n"
        f"Persona behavior: {persona.behavior}\n"
        f"Voice style: {persona.voice_style}\n"
        f"Hidden red flag: {persona.hidden_red_flag or 'none'}\n"
        f"Current conversation phase: {phase_name}\n"
        f"Phase objective: {phase_goal}\n"
        f"Phase directive: {phase_directive}\n"
        f"Phase history: {', '.join(phase_history) if phase_history else 'none'}\n"
        f"Risk cue active: {'yes' if risk_active else 'no'}\n"
        f"Hidden red flag already revealed: {'yes' if red_flag_revealed else 'no'}\n"
        f"Ready to close the call: {'yes' if closing_ready else 'no'}\n"
        f"Scenario memory:\n{scenario_memory}\n"
        f"Industry-specific escalation policy:\n{escalation_policy}\n"
        f"{scenario_text}\n"
        f"Conversation so far:\n{history_lines or 'No prior turns.'}\n\n"
        f"Latest trainee message: {user_message or '[start the conversation with the persona opening line]'}"
    )
