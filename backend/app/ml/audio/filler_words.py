"""Filler-word detection by scanning transcript text."""
import re

_PATTERNS = [re.compile(p, re.IGNORECASE) for p in [
    r'\bum+\b',
    r'\buh+\b',
    r'\blike\b',
    r'\byou know\b',
]]


def count_filler_words(transcript: str) -> int:
    """Return total filler-word occurrences in transcript."""
    return sum(len(p.findall(transcript)) for p in _PATTERNS)
