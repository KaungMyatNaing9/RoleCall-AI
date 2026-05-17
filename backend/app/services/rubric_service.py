import json
import uuid
from typing import Any

from app.config import settings
from app.models.rubric import RubricItem, RubricResponse
from app.prompts.rubric_prompt import (
    RUBRIC_AGENT_SYSTEM_PROMPT,
    build_rubric_agent_prompt,
)
from app.services import persona_service


def _normalize_item_name(name: str) -> str:
    return " ".join(part for part in str(name).strip().split() if part)


def _normalize_weights(items: list[RubricItem]) -> list[RubricItem]:
    if not items:
        return []

    raw = [max(1, item.weight) for item in items]
    total = sum(raw)
    scaled = [max(1, round(weight / total * 100)) for weight in raw]

    diff = 100 - sum(scaled)
    index = 0
    while diff != 0 and scaled:
        i = index % len(scaled)
        if diff > 0:
            scaled[i] += 1
            diff -= 1
        elif scaled[i] > 1:
            scaled[i] -= 1
            diff += 1
        index += 1

    return [items[i].model_copy(update={"weight": scaled[i]}) for i in range(len(items))]


def _focus_keywords() -> dict[str, tuple[str, str, bool]]:
    return {
        "empathy": ("Empathy", "Shows understanding and emotional attunement.", False),
        "clarity": ("Clarity", "Explains the next step in plain, structured language.", False),
        "professionalism": ("Professionalism", "Maintains a calm, respectful, and professional tone.", False),
        "active listening": ("Active listening", "Reflects back details and asks focused follow-up questions.", False),
        "escalation": ("Escalation handling", "Recognizes when the case should shift into escalation or urgent support.", True),
        "compliance": ("Compliance", "Follows the required workflow or policy for the case.", False),
        "customer sat.": ("Customer satisfaction", "Leaves the other person feeling heard and supported.", False),
        "star": ("STAR specificity", "Uses or elicits specific examples rather than vague claims.", False),
        "discovery": ("Discovery quality", "Surfaces the underlying issue with purposeful questions.", False),
        "de-escalation": ("De-escalation", "Reduces tension without losing control of the conversation.", False),
        "nonverbal presence": ("Nonverbal presence", "Uses stable visible presence and attentive posture when video is enabled.", False),
        "eye-contact estimate": ("Eye-contact estimate", "Maintains face-centered presence and steady attention on camera.", False),
        "speaking pace": ("Speaking pace", "Keeps speech pace controlled and appropriate for the situation.", False),
        "filler words": ("Filler word control", "Limits filler words and verbal hesitations.", False),
        "interruptions": ("Interruption control", "Avoids talking over the other person and recovers turn-taking well.", False),
        "turn-taking": ("Turn-taking", "Balances questions, listening, and explanations without dominating.", False),
    }


def _normalize_mode(mode: str | None) -> str:
    value = (mode or "adaptive").strip().lower()
    return value if value in {"adaptive", "phone", "voice", "video", "text"} else "adaptive"


def _is_video_only(name: str) -> bool:
    key = name.strip().lower()
    return key in {"nonverbal presence", "eye-contact estimate"}


def _is_text_incompatible(name: str) -> bool:
    key = name.strip().lower()
    return key in {"speaking pace", "filler word control", "interruption control"}


def _mode_allows_item(mode: str, name: str) -> bool:
    normalized_mode = _normalize_mode(mode)
    if _is_video_only(name):
        return normalized_mode == "video"
    if _is_text_incompatible(name):
        return normalized_mode != "text"
    return True


def _filter_items_for_mode(items: list[RubricItem], mode: str) -> list[RubricItem]:
    return [item for item in items if _mode_allows_item(mode, item.name)]


def _heuristic_rubric(
    scenario_id: str,
    industry: str,
    difficulty: str,
    mode: str,
    evaluation_focus: list[str],
) -> RubricResponse:
    scenario = persona_service.SCENARIO_STORE.get(scenario_id, {})
    description = f"{scenario.get('description', '')} {scenario.get('objective', '')} {scenario.get('success_condition', '')}".lower()
    hot_risk = any(token in description for token in ("red flag", "urgent", "safety", "escalat", "chest", "risk"))

    items: list[RubricItem] = []
    focus_map = _focus_keywords()
    requested = evaluation_focus or ["Empathy", "Clarity", "Active listening", "Escalation"]

    for label in requested:
        name, desc, hot = focus_map.get(label.lower(), (label, f"Performance on {label.lower()}.", False))
        if not _mode_allows_item(mode, name):
            continue
        items.append(
            RubricItem(
                name=_normalize_item_name(name),
                weight=16 if hot else 12,
                is_hot=hot_risk and hot,
                description=desc,
            )
        )

    baseline = [
        RubricItem(name="Question quality", weight=12, is_hot=False, description="Uses focused questions to move the case forward."),
        RubricItem(name="Clarity of next steps", weight=12, is_hot=False, description="Ends each major phase with a clear, practical next step."),
        RubricItem(name="Safety / risk detection", weight=18, is_hot=hot_risk, description="Identifies and responds to high-risk information when present."),
    ]

    existing = {item.name.lower() for item in items}
    for item in baseline:
        if item.name.lower() not in existing:
            items.append(item)

    if difficulty.lower() in {"hard", "expert"}:
        items.append(
            RubricItem(
                name="Composure under pressure",
                weight=12,
                is_hot=False,
                description="Stays structured and calm even when the scenario becomes more difficult.",
            )
        )

    if _normalize_mode(mode) == "video":
        for item in (
            RubricItem(name="Nonverbal presence", weight=10, is_hot=False, description="Uses stable visible presence and attentive posture when video is enabled."),
            RubricItem(name="Eye-contact estimate", weight=10, is_hot=False, description="Maintains face-centered presence and steady attention on camera."),
        ):
            if item.name.lower() not in existing:
                items.append(item)

    deduped: list[RubricItem] = []
    seen: set[str] = set()
    for item in items:
        key = item.name.lower()
        if key in seen:
            continue
        if not _mode_allows_item(mode, item.name):
            continue
        deduped.append(item)
        seen.add(key)

    normalized = _normalize_weights(deduped[:8])
    return RubricResponse(
        id=f"rubric-{uuid.uuid4().hex[:10]}",
        items=normalized,
        total_weight=sum(item.weight for item in normalized),
    )


def _coerce_rubric(payload: dict[str, Any]) -> RubricResponse:
    raw_items = payload.get("items", [])
    items = []
    for item in raw_items:
        try:
            items.append(
                RubricItem(
                    name=_normalize_item_name(item.get("name") or "Criteria"),
                    weight=int(item.get("weight") or 10),
                    is_hot=bool(item.get("is_hot")),
                    description=str(item.get("description") or "Performance on this criterion."),
                )
            )
        except Exception:
            continue
    normalized = _normalize_weights(items)
    return RubricResponse(
        id=f"rubric-{uuid.uuid4().hex[:10]}",
        items=normalized,
        total_weight=sum(item.weight for item in normalized),
    )


async def generate_rubric(
    scenario_id: str,
    industry: str,
    difficulty: str,
    mode: str,
    evaluation_focus: list[str],
) -> RubricResponse:
    scenario = persona_service.SCENARIO_STORE.get(scenario_id)
    if not scenario:
        return _heuristic_rubric(scenario_id, industry, difficulty, mode, evaluation_focus)

    requested_focus = ", ".join(evaluation_focus) if evaluation_focus else "balanced communication evaluation"
    user_prompt = build_rubric_agent_prompt(
        industry=industry,
        difficulty=difficulty,
        mode=mode,
        scenario_title=scenario.get("title", ""),
        scenario_description=scenario.get("description", ""),
        scenario_objective=scenario.get("objective", ""),
        scenario_success_condition=scenario.get("success_condition", ""),
        requested_focus=requested_focus,
    )

    try:
        if settings.openai_api_key:
            payload = await persona_service._openai_json(RUBRIC_AGENT_SYSTEM_PROMPT, user_prompt)
            coerced = _coerce_rubric(payload)
            filtered = _filter_items_for_mode(coerced.items, mode)
            if filtered:
                normalized = _normalize_weights(filtered[:8])
                return RubricResponse(
                    id=coerced.id,
                    items=normalized,
                    total_weight=sum(item.weight for item in normalized),
                )
            return _heuristic_rubric(scenario_id, industry, difficulty, mode, evaluation_focus)
        if settings.anthropic_api_key:
            payload = await persona_service._anthropic_json(RUBRIC_AGENT_SYSTEM_PROMPT, user_prompt)
            coerced = _coerce_rubric(payload)
            filtered = _filter_items_for_mode(coerced.items, mode)
            if filtered:
                normalized = _normalize_weights(filtered[:8])
                return RubricResponse(
                    id=coerced.id,
                    items=normalized,
                    total_weight=sum(item.weight for item in normalized),
                )
            return _heuristic_rubric(scenario_id, industry, difficulty, mode, evaluation_focus)
    except Exception:
        pass

    return _heuristic_rubric(scenario_id, industry, difficulty, mode, evaluation_focus)
