"use client";

import type { AudioSignals, VideoSignals } from "@/lib/apiClient";
import { PRIVACY_NOTICE } from "@/lib/constants";

function SignalMeter({
  label,
  v,
  tone = "violet",
  raw,
}: {
  label: string;
  v: number;
  tone?: "ok" | "warn" | "bad" | "violet" | "teal";
  raw?: string;
}) {
  const colors: Record<string, string> = {
    ok: "#6EE7B7",
    warn: "#FCD34D",
    bad: "#FCA5A5",
    violet: "#B5ACFD",
    teal: "#5EEAD4",
  };
  const c = colors[tone] || colors.violet;

  return (
    <div
      style={{
        padding: "8px 10px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--line)",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--ink-3)",
          marginBottom: 3,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: c }} className="rc-mono">
          {raw ?? `${Math.round(v)}%`}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: 8 + i * 1.5,
                borderRadius: 1,
                background: i <= Math.round(v / 20) ? c : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LiveSignalsPanel({
  video,
  audio,
  showVideo = true,
  showAudio = true,
}: {
  video: VideoSignals;
  audio: AudioSignals;
  showVideo?: boolean;
  showAudio?: boolean;
}) {
  const eyePct = Math.round(video.eye_contact_estimate * 100);
  const stabilityPct = Math.round(video.head_movement_stability * 100);
  const engagementPct = Math.round(video.facial_engagement_estimate * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
      {showVideo && (
        <>
          <SignalMeter
            label="Eye contact"
            v={eyePct}
            tone={eyePct >= 55 ? "ok" : "warn"}
            raw={`${eyePct}%`}
          />
          <SignalMeter
            label="Face centered"
            v={video.face_centered ? 85 : 35}
            tone={video.face_centered ? "ok" : "warn"}
            raw={video.face_centered ? "Yes" : "No"}
          />
          <SignalMeter
            label="Head stability"
            v={stabilityPct}
            tone={stabilityPct >= 60 ? "ok" : "warn"}
            raw={`${stabilityPct}%`}
          />
          <SignalMeter
            label="Engagement"
            v={engagementPct}
            tone={engagementPct >= 60 ? "teal" : "warn"}
            raw={`${engagementPct}%`}
          />
        </>
      )}

      {showAudio && (
        <>
          <SignalMeter
            label="Speaking pace"
            v={Math.min(100, Math.round((video.speaking_pace_wpm / 200) * 100))}
            tone={video.speaking_pace_wpm > 160 ? "warn" : "teal"}
            raw={`${audio.speaking_pace_wpm || video.speaking_pace_wpm} wpm`}
          />
          <SignalMeter
            label="Filler words"
            v={Math.min(100, (audio.filler_word_count || video.filler_word_count) * 8)}
            tone={(audio.filler_word_count || video.filler_word_count) > 8 ? "warn" : "ok"}
            raw={String(audio.filler_word_count ?? video.filler_word_count)}
          />
          <SignalMeter
            label="Interruptions"
            v={Math.min(100, (audio.interruption_count || video.interruption_count) * 20)}
            tone={(audio.interruption_count || video.interruption_count) > 2 ? "warn" : "ok"}
            raw={String(audio.interruption_count ?? video.interruption_count)}
          />
        </>
      )}

      <p style={{ fontSize: 10, color: "var(--ink-3)", lineHeight: 1.45, marginTop: 4 }}>
        {PRIVACY_NOTICE}
      </p>
    </div>
  );
}
