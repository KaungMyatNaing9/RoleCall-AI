"""Speaking pace computation: word count / elapsed time → WPM."""


def compute_wpm(transcript: str, elapsed_seconds: float) -> int:
    """Return words-per-minute rounded to nearest integer."""
    if elapsed_seconds <= 0 or not transcript.strip():
        return 0
    return round(len(transcript.split()) / (elapsed_seconds / 60))
