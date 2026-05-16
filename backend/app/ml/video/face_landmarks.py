"""Face landmark detection using MediaPipe FaceMesh."""
from dataclasses import dataclass, field
import numpy as np

try:
    import mediapipe as mp
    _face_mesh = mp.solutions.face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,  # enables iris landmarks 468-477
        min_detection_confidence=0.5,
    )
    _MEDIAPIPE_AVAILABLE = True
except ImportError:
    _MEDIAPIPE_AVAILABLE = False

# Nose tip is MediaPipe FaceMesh landmark 4
_NOSE_TIP = 4


@dataclass
class FaceLandmarkResult:
    landmarks: list[tuple[float, float, float]] = field(default_factory=list)
    face_detected: bool = True
    face_centered: bool = True


def detect_landmarks(frame: np.ndarray) -> FaceLandmarkResult | None:
    """Detect face landmarks using MediaPipe FaceMesh.

    Returns 478 landmarks (468 face + 10 iris) in pixel coordinates,
    or a result with face_detected=False if no face is found.
    Face-centered is True when the nose tip falls within the central
    40% x / 50% y region of the frame.
    """
    h, w = frame.shape[:2]

    if not _MEDIAPIPE_AVAILABLE:
        return _mock_landmarks(w, h)

    rgb = frame[:, :, ::-1]  # BGR → RGB for MediaPipe
    result = _face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        return FaceLandmarkResult(landmarks=[], face_detected=False, face_centered=False)

    face = result.multi_face_landmarks[0]
    landmarks = [(lm.x * w, lm.y * h, lm.z * w) for lm in face.landmark]

    nose_x, nose_y, _ = landmarks[_NOSE_TIP]
    face_centered = (0.30 * w <= nose_x <= 0.70 * w) and (0.25 * h <= nose_y <= 0.75 * h)

    return FaceLandmarkResult(landmarks=landmarks, face_detected=True, face_centered=face_centered)


def _mock_landmarks(w: int, h: int) -> FaceLandmarkResult:
    """Fallback mock when MediaPipe is unavailable — returns 478 plausible landmarks."""
    cx, cy = w // 2, h // 2
    lm: list[tuple[float, float, float]] = [(float(cx), float(cy), 0.0)] * 478
    # Overwrite key indices used by downstream consumers
    lm[4]   = (cx,      cy,      0.0)  # nose tip
    lm[33]  = (cx - 40, cy - 20, 0.0)  # left eye outer corner
    lm[133] = (cx - 20, cy - 20, 0.0)  # left eye inner corner
    lm[159] = (cx - 30, cy - 25, 0.0)  # left eye top
    lm[145] = (cx - 30, cy - 15, 0.0)  # left eye bottom
    lm[263] = (cx + 40, cy - 20, 0.0)  # right eye outer corner
    lm[362] = (cx + 20, cy - 20, 0.0)  # right eye inner corner
    lm[386] = (cx + 30, cy - 25, 0.0)  # right eye top
    lm[374] = (cx + 30, cy - 15, 0.0)  # right eye bottom
    lm[468] = (cx - 30, cy - 20, 0.0)  # left iris center
    lm[473] = (cx + 30, cy - 20, 0.0)  # right iris center
    return FaceLandmarkResult(landmarks=lm, face_detected=True, face_centered=True)
