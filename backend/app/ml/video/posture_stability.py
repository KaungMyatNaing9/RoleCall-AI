"""Head/posture stability estimation."""
from app.ml.video.face_landmarks import FaceLandmarkResult
import statistics


def estimate_head_stability(landmarks: FaceLandmarkResult, history: list[tuple]) -> float:
    """Estimate head movement stability from nose-tip position across frames.

    Args:
        landmarks: Current frame landmarks
        history: List of (nose_x, nose_y) from previous frames

    Returns:
        Stability score 0.0 (unstable) – 1.0 (very stable)

    Production: use MediaPipe nose tip landmark index 1 for precise tracking.
    Mock: return high stability with slight variation.
    """
    if not landmarks.face_detected or len(landmarks.landmarks) < 5:
        return 0.5

    nose = landmarks.landmarks[4]
    history.append((nose[0], nose[1]))

    if len(history) < 3:
        return 0.85

    xs = [p[0] for p in history[-10:]]
    ys = [p[1] for p in history[-10:]]

    try:
        variance = statistics.variance(xs) + statistics.variance(ys)
        stability = max(0.0, min(1.0, 1.0 - variance / 10000.0))
    except statistics.StatisticsError:
        stability = 0.85

    return round(stability, 3)
