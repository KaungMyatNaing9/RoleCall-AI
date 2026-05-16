"""Gaze estimation from face landmarks."""
from dataclasses import dataclass
from app.ml.video.face_landmarks import FaceLandmarkResult
import math


@dataclass
class GazeEstimate:
    eye_contact_score: float  # 0.0 – 1.0
    gaze_direction_x: float   # -1 (left) to +1 (right)
    gaze_direction_y: float   # -1 (up) to +1 (down)


def estimate_gaze(landmarks: FaceLandmarkResult) -> GazeEstimate:
    """Estimate gaze direction from eye landmark positions.

    Production: use iris landmark indices from MediaPipe FaceMesh
    to compute normalized gaze offset from iris center to eye center.

    Mock: return camera-facing gaze with slight variation.
    """
    if not landmarks.face_detected or len(landmarks.landmarks) < 4:
        return GazeEstimate(eye_contact_score=0.0, gaze_direction_x=0.0, gaze_direction_y=0.0)

    left_outer = landmarks.landmarks[0]
    left_inner = landmarks.landmarks[1]
    right_inner = landmarks.landmarks[2]
    right_outer = landmarks.landmarks[3]

    left_eye_cx = (left_outer[0] + left_inner[0]) / 2
    right_eye_cx = (right_outer[0] + right_inner[0]) / 2
    eye_center_x = (left_eye_cx + right_eye_cx) / 2

    # Mock: simulate slight gaze offset
    gaze_x = 0.05
    gaze_y = -0.02
    proximity_to_center = 1.0 - min(1.0, math.sqrt(gaze_x**2 + gaze_y**2) * 2)
    eye_contact = 0.55 + proximity_to_center * 0.35

    return GazeEstimate(
        eye_contact_score=round(eye_contact, 3),
        gaze_direction_x=round(gaze_x, 3),
        gaze_direction_y=round(gaze_y, 3),
    )
