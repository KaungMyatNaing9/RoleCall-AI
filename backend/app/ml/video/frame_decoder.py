"""Frame decoder: base64 JPEG → numpy array."""
import base64
import numpy as np


def decode_b64_frame(b64: str) -> np.ndarray:
    """Decode a base64-encoded JPEG frame to a numpy array (H, W, C)."""
    try:
        data = base64.b64decode(b64)
        arr = np.frombuffer(data, dtype=np.uint8)
        # In production: cv2.imdecode(arr, cv2.IMREAD_COLOR)
        # Mock: return a small placeholder array
        return np.zeros((480, 640, 3), dtype=np.uint8)
    except Exception:
        return np.zeros((480, 640, 3), dtype=np.uint8)
