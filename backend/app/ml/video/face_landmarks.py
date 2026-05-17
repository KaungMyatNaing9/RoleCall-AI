"""Face landmark detection using MediaPipe Face Landmarker Tasks API."""
from dataclasses import dataclass, field
import pathlib
import urllib.request

import numpy as np

_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "face_landmarker/face_landmarker/float16/1/face_landmarker.task"
)
_MODEL_PATH = pathlib.Path(__file__).parent / "face_landmarker.task"
_NOSE_TIP = 4

_landmarker = None
_MEDIAPIPE_AVAILABLE = False
_INIT_ERROR = ""


def _init() -> None:
    global _landmarker, _MEDIAPIPE_AVAILABLE, _INIT_ERROR
    try:
        if not _MODEL_PATH.exists():
            print(f"[face_landmarks] Downloading model to {_MODEL_PATH} …")
            urllib.request.urlretrieve(_MODEL_URL, _MODEL_PATH)
            print("[face_landmarks] Model downloaded.")

        import mediapipe as mp

        opts = mp.tasks.vision.FaceLandmarkerOptions(
            base_options=mp.tasks.BaseOptions(
                model_asset_path=str(_MODEL_PATH),
                delegate=mp.tasks.BaseOptions.Delegate.CPU,
            ),
            running_mode=mp.tasks.vision.RunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=0.5,
            min_face_presence_confidence=0.5,
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
        )
        _landmarker = mp.tasks.vision.FaceLandmarker.create_from_options(opts)
        _MEDIAPIPE_AVAILABLE = True
        _INIT_ERROR = ""
    except Exception as exc:
        print(f"[face_landmarks] MediaPipe unavailable ({exc}), using mock.")
        _MEDIAPIPE_AVAILABLE = False
        _INIT_ERROR = str(exc)


_init()


@dataclass
class FaceLandmarkResult:
    landmarks: list[tuple[float, float, float]] = field(default_factory=list)
    face_detected: bool = True
    face_centered: bool = True


def detect_landmarks(frame: np.ndarray) -> FaceLandmarkResult:
    """Detect 478 face landmarks (includes iris 468-477) in pixel coordinates."""
    h, w = frame.shape[:2]

    if not _MEDIAPIPE_AVAILABLE or _landmarker is None:
        return _mock_landmarks(w, h)

    try:
        import mediapipe as mp

        rgb = np.ascontiguousarray(frame[:, :, ::-1])  # BGR -> RGB
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        result = _landmarker.detect(mp_image)
    except Exception:
        return _mock_landmarks(w, h)

    if not result.face_landmarks:
        return FaceLandmarkResult(landmarks=[], face_detected=False, face_centered=False)

    face = result.face_landmarks[0]
    landmarks = [(lm.x * w, lm.y * h, lm.z * w) for lm in face]

    nose_x, nose_y, _ = landmarks[_NOSE_TIP]
    face_centered = (0.30 * w <= nose_x <= 0.70 * w) and (0.25 * h <= nose_y <= 0.75 * h)
    return FaceLandmarkResult(landmarks=landmarks, face_detected=True, face_centered=face_centered)


def _mock_landmarks(w: int, h: int) -> FaceLandmarkResult:
    """Fallback mock when MediaPipe is unavailable — returns 478 plausible landmarks."""
    cx, cy = w // 2, h // 2
    lm: list[tuple[float, float, float]] = [(float(cx), float(cy), 0.0)] * 478
    lm[4] = (cx, cy, 0.0)
    lm[33] = (cx - 40, cy - 20, 0.0)
    lm[133] = (cx - 20, cy - 20, 0.0)
    lm[159] = (cx - 30, cy - 25, 0.0)
    lm[145] = (cx - 30, cy - 15, 0.0)
    lm[263] = (cx + 40, cy - 20, 0.0)
    lm[362] = (cx + 20, cy - 20, 0.0)
    lm[386] = (cx + 30, cy - 25, 0.0)
    lm[374] = (cx + 30, cy - 15, 0.0)
    lm[468] = (cx - 30, cy - 20, 0.0)
    lm[473] = (cx + 30, cy - 20, 0.0)
    return FaceLandmarkResult(landmarks=lm, face_detected=True, face_centered=True)


def runtime_status() -> dict[str, object]:
    return {
        "mediapipe_available": _MEDIAPIPE_AVAILABLE,
        "model_asset_present": _MODEL_PATH.exists(),
        "live_pipeline_ready": _MEDIAPIPE_AVAILABLE and _landmarker is not None,
        "detail": _INIT_ERROR,
    }
