from __future__ import annotations

from app.ml.audio.filler_words import count_filler_words
from app.ml.audio.speaking_pace import compute_wpm
from app.models.signals import AudioSignals


def _count_abrupt_restarts(turns: list[str]) -> int:
    total = 0
    for turn in turns:
        lower = turn.strip().lower()
        if lower.startswith(("wait", "hold on", "sorry", "no,", "no ", "but ", "actually")):
            total += 1
    return total


def _count_pause_markers(turns: list[str]) -> tuple[int, float, float]:
    pause_count = 0
    pause_lengths: list[float] = []
    for turn in turns:
        commas = turn.count(",")
        ellipses = turn.count("...")
        dashes = turn.count(" - ") + turn.count(" -- ")
        markers = commas + ellipses * 2 + dashes
        pause_count += markers
        if markers:
            pause_lengths.extend([1.2 + min(1.8, len(turn.split()) / 18)] * markers)

    if not pause_lengths:
        return 1, 1.4, 2.1
    avg_pause = round(sum(pause_lengths) / len(pause_lengths), 1)
    longest_pause = round(max(pause_lengths) + 0.9, 1)
    return max(1, pause_count), avg_pause, longest_pause


def analyze_history(history: list[dict[str, str]]) -> AudioSignals:
    user_turns = [item["text"] for item in history if item["speaker"] == "user"]
    if not user_turns:
        return AudioSignals(
            speaking_pace_wpm=0,
            pause_count=0,
            avg_pause_duration_s=0.0,
            longest_pause_s=0.0,
            filler_word_count=0,
            interruption_count=0,
            avg_response_time_s=0.0,
            total_speaking_time_s=0.0,
            analysis_source="audio_signal_service",
            confidence=0.0,
        )

    transcript = " ".join(user_turns)
    total_words = len(transcript.split())
    total_speaking_time_s = round(total_words / 2.25, 1)
    speaking_pace_wpm = compute_wpm(transcript, max(1.0, total_speaking_time_s))
    filler_word_count = count_filler_words(transcript)
    pause_count, avg_pause_duration_s, longest_pause_s = _count_pause_markers(user_turns)

    same_speaker_interruptions = sum(
        1 for i in range(1, len(history))
        if history[i]["speaker"] == history[i - 1]["speaker"] == "user"
    )
    interruption_count = same_speaker_interruptions + _count_abrupt_restarts(user_turns)

    avg_words_per_turn = total_words / max(1, len(user_turns))
    avg_response_time_s = round(
        max(1.1, min(8.5, 1.3 + avg_words_per_turn * 0.12 + filler_word_count * 0.08)),
        1,
    )

    confidence = min(0.92, 0.32 + len(user_turns) * 0.12 + min(total_words, 120) / 220)
    return AudioSignals(
        speaking_pace_wpm=speaking_pace_wpm,
        pause_count=pause_count,
        avg_pause_duration_s=avg_pause_duration_s,
        longest_pause_s=longest_pause_s,
        filler_word_count=filler_word_count,
        interruption_count=interruption_count,
        avg_response_time_s=avg_response_time_s,
        total_speaking_time_s=total_speaking_time_s,
        analysis_source="audio_signal_service",
        confidence=round(confidence, 2),
    )


def summarize_transcript(transcript: str, duration_s: float) -> AudioSignals:
    text = transcript.strip()
    if not text:
        return AudioSignals(
            speaking_pace_wpm=0,
            pause_count=0,
            avg_pause_duration_s=0.0,
            longest_pause_s=0.0,
            filler_word_count=0,
            interruption_count=0,
            avg_response_time_s=0.0,
            total_speaking_time_s=0.0,
            analysis_source="audio_signal_service",
            confidence=0.0,
        )

    filler_word_count = count_filler_words(text)
    speaking_pace_wpm = compute_wpm(text, max(1.0, duration_s))
    pause_count, avg_pause_duration_s, longest_pause_s = _count_pause_markers([text])
    total_words = len(text.split())
    total_speaking_time_s = round(min(duration_s, total_words / 2.25), 1)
    return AudioSignals(
        speaking_pace_wpm=speaking_pace_wpm,
        pause_count=pause_count,
        avg_pause_duration_s=avg_pause_duration_s,
        longest_pause_s=longest_pause_s,
        filler_word_count=filler_word_count,
        interruption_count=_count_abrupt_restarts([text]),
        avg_response_time_s=0.0,
        total_speaking_time_s=total_speaking_time_s,
        analysis_source="audio_signal_service",
        confidence=round(min(0.88, 0.45 + min(total_words, 100) / 180), 2),
    )
