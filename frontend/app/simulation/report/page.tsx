"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useSimulationStore } from "@/stores/simulationStore";
import { PRIVACY_NOTICE } from "@/lib/constants";
import { mergeReportInsights } from "@/lib/signalInsights";
import type { EvaluationReport } from "@/lib/apiClient";

const MOCK_REPORT: EvaluationReport = {
  session_id: "demo",
  overall_score: 78,
  persona_name: "Margaret Lewis",
  duration: "5:42",
  mode: "video",
  industry: "Healthcare",
  difficulty: "Medium",
  skill_scores: {
    Empathy: 86,
    Clarity: 80,
    "Active listening": 74,
    "Safety / escalation": 58,
    Professionalism: 84,
  },
  key_moments: [
    {
      timestamp: "02:41",
      position_pct: 0.47,
      type: "risk",
      title: "Escalation missed",
      excerpt: "…and I felt this tightness in my chest…",
      why_it_mattered: "Chest tightness after surgery needs urgent follow-up.",
      better_response:
        "Because you mentioned chest tightness, I need to connect you with clinical support right away.",
    },
  ],
  annotated_transcript: [
    {
      speaker: "You",
      timestamp: "00:42",
      text: "I can hear this has been a worrying time. Let me help you step by step.",
      tag: "strong",
      tag_label: "Strong empathy",
    },
    {
      speaker: "Margaret Lewis",
      timestamp: "02:41",
      text: "…and I felt this tightness in my chest.",
      tag: "risk",
      tag_label: "Red flag",
    },
  ],
  multimodal_insights: [
    { label: "Speaking pace", value: "164 wpm", tone: "warn" },
    { label: "Filler words", value: "12", tone: "warn" },
    { label: "Interruptions", value: "3", tone: "warn" },
  ],
  coach_feedback: {
    did_well: "Strong empathy and calm tone throughout.",
    missed: "When chest tightness was mentioned, escalation was delayed.",
    try_next: "Practice a short red-flag escalation drill.",
    next_drill_title: "Red-flag escalation drill",
  },
  next_practice: [],
  privacy_notice: PRIVACY_NOTICE,
};

const TAG_COLORS: Record<string, string> = {
  strong: "#6EE7B7",
  improve: "#FCD34D",
  risk: "#FCA5A5",
  question: "#93B4FF",
};

export default function ReportPage() {
  const storeReport = useSimulationStore((s) => s.report);
  const sessionVideo = useSimulationStore((s) => s.sessionVideoSignals);
  const sessionAudio = useSimulationStore((s) => s.sessionAudioSignals);
  const r = storeReport ?? MOCK_REPORT;
  const multimodalInsights = useMemo(
    () => mergeReportInsights(r, sessionVideo, sessionAudio),
    [r, sessionAudio, sessionVideo],
  );
  const [momentIndex, setMomentIndex] = useState(0);
  const moment = r.key_moments[momentIndex] ?? null;

  return (
    <AppShell>
      <TopNav active="Report" compact />
      <main style={{ flex: 1, padding: "24px 28px", maxWidth: 900, margin: "0 auto" }}>
        <header
          className="rc-glass"
          style={{
            padding: 20,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <ScoreRing value={r.overall_score} size={88} thick={8} label="Score" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 className="rc-h-2" style={{ margin: "0 0 6px", fontSize: 22 }}>
              {r.persona_name}
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)" }}>
              {r.industry} · {r.mode} · {r.duration}
            </p>
          </div>
          <Link href="/create">
            <button type="button" className="rc-btn primary">
              Practice again
            </button>
          </Link>
        </header>

        {moment && (
          <section className="rc-glass" style={{ padding: 18, marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 10px", color: "#FCA5A5" }}>
              Key moment · {moment.title}
            </h2>
            <p style={{ margin: "0 0 12px", fontSize: 14, fontStyle: "italic", color: "var(--ink-1)" }}>
              &ldquo;{moment.excerpt}&rdquo;
            </p>
            {moment.why_it_mattered && (
              <p style={{ margin: 0, fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                {moment.why_it_mattered}
              </p>
            )}
            {r.key_moments.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                {r.key_moments.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    className="rc-btn sm"
                    onClick={() => setMomentIndex(i)}
                    style={{
                      background: i === momentIndex ? "rgba(139,125,251,0.2)" : undefined,
                    }}
                  >
                    {m.timestamp}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="rc-glass" style={{ padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 14px" }}>Skills</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {Object.entries(r.skill_scores).map(([name, score]) => (
              <div
                key={name}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{score}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rc-glass" style={{ padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Coach notes</h2>
          <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.55, color: "var(--ink-1)" }}>
            <strong style={{ color: "#6EE7B7" }}>Well:</strong> {r.coach_feedback.did_well}
          </p>
          <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.55, color: "var(--ink-1)" }}>
            <strong style={{ color: "#FCA5A5" }}>Missed:</strong> {r.coach_feedback.missed}
          </p>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--ink-1)" }}>
            <strong style={{ color: "#B5ACFD" }}>Next:</strong> {r.coach_feedback.try_next}
          </p>
        </section>

        <section className="rc-glass" style={{ padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Transcript</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {r.annotated_transcript.map((line, i) => (
              <article
                key={i}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  borderLeftColor: line.tag ? TAG_COLORS[line.tag] : "var(--line)",
                  borderLeftWidth: line.tag ? 3 : 1,
                }}
              >
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>
                  {line.speaker} · {line.timestamp}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--ink-1)" }}>{line.text}</p>
              </article>
            ))}
          </div>
        </section>

        {multimodalInsights.length > 0 && (
          <section className="rc-glass" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Signals</h2>
            <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {multimodalInsights.map((x) => (
                <li key={x.label} style={{ fontSize: 14, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--ink-2)" }}>{x.label}</span>
                  <span style={{ fontWeight: 600 }}>{x.value}</span>
                </li>
              ))}
            </ul>
            <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{r.privacy_notice}</p>
          </section>
        )}
      </main>
    </AppShell>
  );
}
