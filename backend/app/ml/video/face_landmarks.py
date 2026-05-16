"""Face landmark detection using MediaPipe FaceMesh."""
from dataclasses import dataclass, field
import numpy as np


@dataclass
class FaceLandmarkResult:
    landmarks: list[tuple[float, float, float]] = field(default_factory=list)
    face_detected: bool = True
    face_centered: bool = True


def detect_landmarks(frame: np.ndarray) -> FaceLandmarkResult | None:
    """Detect face landmarks from a frame.

    Production: use MediaPipe FaceMesh.
    Mock: return plausible centered-face coordinates.
    """
    h, w = frame.shape[:2]
    cx, cy = w // 2, h // 2
    mock_landmarks = [
        (cx - 40, cy - 20, 0.0),   # left eye outer
        (cx - 20, cy - 20, 0.0),   # left eye inner
        (cx + 20, cy - 20, 0.0),   # right eye inner
        (cx + 40, cy - 20, 0.0),   # right eye outer
        (cx, cy, 0.0),              # nose tip
        (cx - 30, cy + 30, 0.0),   # mouth left
        (cx + 30, cy + 30, 0.0),   # mouth right
    ]
    return FaceLandmarkResult(
        landmarks=mock_landmarks,
        face_detected=True,
        face_centered=True,
    )
