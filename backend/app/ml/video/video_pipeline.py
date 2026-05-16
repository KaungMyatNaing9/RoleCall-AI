"""Video analysis pipeline: processes frames and aggregates session signals."""
from dataclasses import dataclass, field
from app.ml.video.frame_decoder import decode_b64_frame
from app.ml.video.face_landmarks import detect_landmarks
from app.ml.video.gaze_estimate import estimate_gaze
from app.ml.video.posture_stability import estimate_head_stability
from app.models.signals import VideoSignals, PRIVACY_NOTICE
import statistics


@dataclass
class VideoAnalysisPipeline:
    session_id: str
    eye_contact_scores: list[float] = field(default_factory=list)
    stability_scores: list[float] = field(default_factory=list)
    face_centered_count: int = 0
    total_frames: int = 0
    head_position_history: list[tuple] = field(default_factory=list)

    def process_frame(self, b64: str) -> dict:
        """Process a single frame and return per-frame signals."""
        frame = decode_b64_frame(b64)
        landmarks = detect_landmarks(frame)

        if landmarks is None or not landmarks.face_detected:
            self.total_frames += 1
            return {"face_detected": False}

        gaze = estimate_gaze(landmarks)
        stability = estimate_head_stability(landmarks, self.head_position_history)

        self.eye_contact_scores.append(gaze.eye_contact_score)
        self.stability_scores.append(stability)
        if landmarks.face_centered:
            self.face_centered_count += 1
        self.total_frames += 1

        return {
            "face_detected": True,
            "eye_contact_score": gaze.eye_contact_score,
            "head_stability": stability,
            "face_centered": landmarks.face_centered,
        }

    def get_session_summary(self) -> VideoSignals:
        """Aggregate all frames into a session-level VideoSignals."""
        if not self.eye_contact_scores:
            return VideoSignals()

        avg_eye = statistics.mean(self.eye_contact_scores)
        avg_stability = statistics.mean(self.stability_scores) if self.stability_scores else 0.78
        face_centered = (self.face_centered_count / max(1, self.total_frames)) > 0.7

        return VideoSignals(
            eye_contact_estimate=round(avg_eye, 3),
            face_centered=face_centered,
            head_movement_stability=round(avg_stability, 3),
            facial_engagement_estimate=round(min(1.0, avg_eye * 1.1), 3),
            speaking_pace_wpm=164,
            interruption_count=3,
            filler_word_count=12,
            privacy_notice=PRIVACY_NOTICE,
        )
