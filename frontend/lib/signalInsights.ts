import type { AudioSignals, EvaluationReport, MultimodalInsightItem, VideoSignals } from "@/lib/apiClient";

function toneFromHigh(value: number, warn: number, bad: number): "ok" | "warn" | "bad" {
  if (value >= bad) return "bad";
  if (value >= warn) return "warn";
  return "ok";
}

export function insightsFromSessionSignals(
  video: VideoSignals | null,
  audio: AudioSignals | null,
): MultimodalInsightItem[] {
  const items: MultimodalInsightItem[] = [];

  if (video) {
    items.push(
      {
        label: "Eye-contact estimate",
        value: `${Math.round(video.eye_contact_estimate * 100)}%`,
        tone: video.eye_contact_estimate >= 0.55 ? "ok" : "warn",
      },
      {
        label: "Face centered",
        value: video.face_centered ? "Yes" : "No",
        tone: video.face_centered ? "ok" : "warn",
      },
      {
        label: "Head stability",
        value: `${Math.round(video.head_movement_stability * 100)}%`,
        tone: video.head_movement_stability >= 0.6 ? "ok" : "warn",
      },
      {
        label: "Facial engagement",
        value: `${Math.round(video.facial_engagement_estimate * 100)}%`,
        tone: video.facial_engagement_estimate >= 0.6 ? "ok" : "warn",
      },
    );
  }

  if (audio) {
    items.push(
      {
        label: "Speaking pace",
        value: `${audio.speaking_pace_wpm} wpm`,
        note: audio.speaking_pace_wpm > 160 ? "slightly fast" : audio.speaking_pace_wpm < 110 ? "slow" : undefined,
        tone: toneFromHigh(audio.speaking_pace_wpm, 160, 190),
      },
      {
        label: "Filler words",
        value: String(audio.filler_word_count),
        tone: toneFromHigh(audio.filler_word_count, 5, 12),
      },
      {
        label: "Interruptions",
        value: String(audio.interruption_count),
        tone: toneFromHigh(audio.interruption_count, 2, 5),
      },
      {
        label: "Avg response latency",
        value: `${audio.avg_response_time_s}s`,
        tone: toneFromHigh(audio.avg_response_time_s, 6, 10),
      },
    );
  }

  return items;
}

export function mergeReportInsights(
  report: EvaluationReport,
  video: VideoSignals | null,
  audio: AudioSignals | null,
): MultimodalInsightItem[] {
  const sessionItems = insightsFromSessionSignals(video, audio);
  if (!sessionItems.length) return report.multimodal_insights;

  const sessionLabels = new Set(sessionItems.map((item) => item.label));
  const remaining = report.multimodal_insights.filter((item) => !sessionLabels.has(item.label));
  return [...sessionItems, ...remaining];
}
