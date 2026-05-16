"""Gaze estimation from iris landmarks (MediaPipe FaceMesh indices 468 / 473)."""
from dataclasses import dataclass
import math
from app.ml.video.face_landmarks import FaceLandmarkResult

# MediaPipe FaceMesh landmark indices
_LEFT_EYE_OUTER   = 33
_LEFT_EYE_INNER   = 133
_LEFT_EYE_TOP     = 159
_LEFT_EYE_BOTTOM  = 145
_RIGHT_EYE_INNER  = 362
_RIGHT_EYE_OUTER  = 263
_RIGHT_EYE_TOP    = 386
_RIGHT_EYE_BOTTOM = 374
_LEFT_IRIS        = 468  # left iris center (refine_landmarks=True)
_RIGHT_IRIS       = 473  # right iris center


@dataclass
class GazeEstimate:
    eye_contact_score: float  # 0.0 – 1.0
    gaze_direction_x: float   # -1 (left) to +1 (right)
    gaze_direction_y: float   # -1 (up) to +1 (down)


def estimate_gaze(landmarks: FaceLandmarkResult) -> GazeEstimate:
    """Estimate gaze from iris center position relative to eye corners.

    Computes the normalized offset of each iris center within its eye bounding
    box; 0.5 on both axes means looking straight at the camera.
    """
    if not landmarks.face_detected or len(landmarks.landmarks) < 478:
        return GazeEstimate(eye_contact_score=0.0, gaze_direction_x=0.0, gaze_direction_y=0.0)

    lm = landmarks.landmarks

    left_outer  = lm[_LEFT_EYE_OUTER]
    left_inner  = lm[_LEFT_EYE_INNER]
    left_top    = lm[_LEFT_EYE_TOP]
    left_bottom = lm[_LEFT_EYE_BOTTOM]
    left_iris   = lm[_LEFT_IRIS]

    right_inner  = lm[_RIGHT_EYE_INNER]
    right_outer  = lm[_RIGHT_EYE_OUTER]
    right_top    = lm[_RIGHT_EYE_TOP]
    right_bottom = lm[_RIGHT_EYE_BOTTOM]
    right_iris   = lm[_RIGHT_IRIS]

    # Horizontal: normalized iris x within [eye_outer_x, eye_inner_x]
    left_eye_w  = abs(left_inner[0]  - left_outer[0])
    right_eye_w = abs(right_outer[0] - right_inner[0])
    left_iris_rel_x  = (left_iris[0]  - left_outer[0])  / left_eye_w  if left_eye_w  > 1 else 0.5
    right_iris_rel_x = (right_iris[0] - right_inner[0]) / right_eye_w if right_eye_w > 1 else 0.5
    gaze_x = ((left_iris_rel_x + right_iris_rel_x) / 2 - 0.5) * 2  # −1…+1

    # Vertical: normalized iris y within [eye_top_y, eye_bottom_y]
    left_eye_h  = abs(left_bottom[1]  - left_top[1])
    right_eye_h = abs(right_bottom[1] - right_top[1])
    left_iris_rel_y  = (left_iris[1]  - left_top[1])  / left_eye_h  if left_eye_h  > 1 else 0.5
    right_iris_rel_y = (right_iris[1] - right_top[1]) / right_eye_h if right_eye_h > 1 else 0.5
    gaze_y = ((left_iris_rel_y + right_iris_rel_y) / 2 - 0.5) * 2  # −1…+1

    deviation     = math.sqrt(gaze_x**2 + gaze_y**2)
    eye_contact   = max(0.0, min(1.0, 1.0 - deviation))

    return GazeEstimate(
        eye_contact_score=round(eye_contact, 3),
        gaze_direction_x=round(gaze_x, 3),
        gaze_direction_y=round(gaze_y, 3),
    )
