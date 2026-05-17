"""Frame decoder: base64 JPEG → numpy array."""
import base64
import numpy as np

try:
    import cv2
    _CV2_AVAILABLE = True
except ImportError:
    _CV2_AVAILABLE = False


def cv2_available() -> bool:
    return _CV2_AVAILABLE


def decode_b64_frame(b64: str) -> np.ndarray:
    """Decode a base64-encoded JPEG frame to a numpy array (H, W, C) in BGR."""
    try:
        data = base64.b64decode(b64)
        arr = np.frombuffer(data, dtype=np.uint8)
        if _CV2_AVAILABLE:
            frame = cv2.imdecode(arr, cv2.IMREAD_COLOR)
            if frame is not None:
                return frame
    except Exception:
        pass
    return np.zeros((480, 640, 3), dtype=np.uint8)
