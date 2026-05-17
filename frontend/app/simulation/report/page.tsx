"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useSimulationStore } from "@/stores/simulationStore";
import { Icons } from "@/components/icons";
import { PRIVACY_NOTICE } from "@/lib/constants";

const TAG_COLORS: Record<string, string> = {
  strong: "#6EE7B7",
  improve: "#FCD34D",
  risk: "#FCA5A5",
  question: "#93B4FF",
};

const MOMENT_COLORS: Record<string, string> = { strong: "#6EE7B7", improve: "#FCD34D", risk: "#FCA5A5", question: "#93B4FF" };

function parseDurationToSeconds(d: string): number {
  const parts = d.split(":").map(Number);
  return parts.length === 2 ? parts[0] * 60 + parts[1] : 0;
}

function fmtSeconds(s: number): string {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

function ScoreTile({ l, v, hot }: { l: string; v: number; hot?: boolean }) {
  const c = v >= 80 ? "#5EEAD4" : v >= 70 ? "#93B4FF" : v >= 60 ? "#FCD34D" : "#FCA5A5";
  return (
    <div style={{ padding: "10px 12px", borderRadius: 10, background: hot ? "linear-gradient(180deg, rgba(248,113,113,0.10), rgba(248,113,113,0.02))" : "rgba(255,255,255,0.03)", border: hot ? "1px solid rgba(248,113,113,0.45)" : "1px solid var(--line)", position: "relative" }}>
      {hot && <div style={{ position: "absolute", top: 7, right: 8, fontSize: 9, color: "#FCA5A5", fontWeight: 600, letterSpacing: "0.05em" }}>FOCUS</div>}
      <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.03em", textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: c, letterSpacing: "-0.02em" }}>{v}</span>
        <span style={{ fontSize: 10, color: "var(--ink-3)" }}>/100</span>
      </div>
      <div style={{ height: 3, marginTop: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${v}%`, background: c, opacity: 0.8 }} />
      </div>
    </div>
  );
}

function ModalityTile({
  modality,
  weight,
  used,
  confidence,
  note,
}: {
  modality: string;
  weight: number;
  used: boolean;
  confidence?: number;
  note?: string;
}) {
  const tone = !used ? "#94A3B8" : modality === "Video" ? "#93B4FF" : modality === "Audio" ? "#5EEAD4" : "#FCD34D";
  return (
    <div style={{ padding: "10px 12px", borderRadius: 10, background: used ? "rgba(255,255,255,0.03)" : "rgba(148,163,184,0.06)", border: used ? "1px solid var(--line)" : "1px solid rgba(148,163,184,0.2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{modality}</div>
        <div className={`rc-pill ${used ? "ok" : ""}`} style={!used ? { opacity: 0.7 } : undefined}>{used ? "Used in scoring" : "Not applied"}</div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: tone }}>{weight}%</span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>rubric weight</span>
      </div>
      {typeof confidence === "number" && <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 4 }}>Confidence: {confidence}%</div>}
      {note && <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.45, marginTop: 4 }}>{note}</div>}
    </div>
  );
}

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const entries = Object.entries(scores);
  const N = entries.length;
  if (N < 3) return null;

  const cx = 100, cy = 100, r = 72;

  const pt = (i: number, val: number) => {
    const angle = (2 * Math.PI / N) * i - Math.PI / 2;
    const d = r * val / 100;
    return { x: cx + d * Math.cos(angle), y: cy + d * Math.sin(angle) };
  };

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";

  const scorePts = entries.map(([, v], i) => pt(i, v));

  return (
    <svg width={200} height={200} style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
      {[20, 40, 60, 80, 100].map((l) => (
        <path key={l} d={toPath(entries.map((_, i) => pt(i, l)))} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {entries.map((_, i) => {
        const p = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}
      <path d={toPath(scorePts)} fill="rgba(93,234,191,0.12)" stroke="#5EEAD4" strokeWidth="1.5" />
      {scorePts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill="#5EEAD4" />)}
      {entries.map(([k, v], i) => {
        const p = pt(i, 122);
        const anchor = p.x < cx - 4 ? "end" : p.x > cx + 4 ? "start" : "middle";
        const color = v >= 80 ? "#5EEAD4" : v >= 60 ? "#FCD34D" : "#FCA5A5";
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle" fontSize="8.5" fontFamily="inherit">
            <tspan fill="var(--ink-2)">{k.length > 12 ? k.slice(0, 11) + "…" : k}</tspan>
            <tspan fill={color} fontWeight="700"> {v}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

export default function ReportPage() {
  const storeReport = useSimulationStore((s) => s.report);
  if (!storeReport) {
    return (
      <AppShell>
        <TopNav active="Reports" compact />
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 28 }}>
          <div className="rc-glass" style={{ width: 560, maxWidth: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
              <Icons.warn size={24} />
            </div>
            <h1 className="rc-h-2" style={{ margin: "0 0 10px" }}>No evaluation report available</h1>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 20 }}>
              Complete a simulation session first, then return here from the analyzing flow.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <Link href="/dashboard"><button className="rc-btn ghost">Back to dashboard</button></Link>
              <Link href="/create"><button className="rc-btn primary"><Icons.sparkle size={13} />Start a simulation</button></Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }
  const r = storeReport;
  const [selectedMoment, setSelectedMoment] = useState(() =>
    r.key_moments.findIndex((m) => m.score_impact != null && m.score_impact < 0)
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

        {r.multimodal_insights.length > 0 && (
          <section className="rc-glass" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Signals</h2>
            <ul style={{ margin: "0 0 12px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {r.multimodal_insights.map((x) => (
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
