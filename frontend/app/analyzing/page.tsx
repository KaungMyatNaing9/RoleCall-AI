"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Icons } from "@/components/icons";
import { useSimulationStore } from "@/stores/simulationStore";
import { api } from "@/lib/apiClient";

const ANALYSIS_STEPS = [
  { n: "Transcribing conversation", sub: "412 turns · 5:42 audio" },
  { n: "Reviewing rubric performance", sub: "7 criteria scored" },
  { n: "Measuring speaking patterns", sub: "Pace, pauses, fillers" },
  { n: "Analyzing video interaction signals", sub: "Eye-contact estimate, head stability, turn-taking" },
  { n: "Generating coaching feedback", sub: "" },
  { n: "Building next practice plan", sub: "" },
];

export default function AnalyzingPage() {
  const router = useRouter();
  const store = useSimulationStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const sessionId = store.simulationId || `session-${Date.now()}`;

    const advance = (step: number) => {
      setCurrentStep(step);
      if (step < ANALYSIS_STEPS.length - 1) {
        setTimeout(() => advance(step + 1), 600);
      } else {
        api.generateEvaluation({ session_id: sessionId, persona_id: "persona-margaret-001", scenario_id: "scenario-postdischarge-001", rubric_id: "rubric-healthcare-001" })
          .then(report => {
            store.setReport(report);
            setTimeout(() => router.push("/simulation/report"), 800);
          })
          .catch(() => setTimeout(() => router.push("/simulation/report"), 1500));
      }
    };

    setTimeout(() => advance(0), 500);
  }, []);

  return (
    <AppShell>
      <div style={{ flex: 1, display: "grid", placeItems: "center", position: "relative" }}>
        <div style={{ width: 680, maxWidth: "90%", textAlign: "center" }}>
          {/* Animated ring */}
          <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto 32px" }}>
            <svg width="160" height="160" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="anagrad" x1="0" y1="0" x2="160" y2="160">
                  <stop offset="0" stopColor="#2DD4BF" /><stop offset="0.5" stopColor="#4F7CFF" /><stop offset="1" stopColor="#8B7DFB" />
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="url(#anagrad)" strokeWidth="2" strokeDasharray="120 440" strokeLinecap="round" style={{ animation: "rc-spin 2s linear infinite", transformOrigin: "80px 80px" }} />
              <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
              <circle cx="80" cy="80" r="56" fill="none" stroke="#8B7DFB" strokeWidth="2" strokeDasharray="40 320" strokeLinecap="round" style={{ animation: "rc-spin 3.2s linear reverse infinite", transformOrigin: "80px 80px" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><Icons.sparkle size={32} /></div>
          </div>

          <div className="rc-pill violet" style={{ marginBottom: 14 }}><Icons.sparkle size={11} /> 6 agents · analyzing</div>
          <h1 className="rc-h-1" style={{ margin: 0 }}>Analyzing your simulation</h1>
          <div style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8, marginBottom: 36 }}>Reviewing the transcript, audio patterns, and video interaction signals.</div>

          <div className="rc-glass" style={{ padding: 18, textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ANALYSIS_STEPS.map((s, i) => {
                const isDone = i < currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 99, display: "grid", placeItems: "center", flexShrink: 0, background: isDone ? "linear-gradient(135deg,#2DD4BF,#8B7DFB)" : isActive ? "rgba(139,125,251,0.2)" : "rgba(255,255,255,0.05)", color: isDone ? "#06241F" : "#B5ACFD", border: !isDone && !isActive ? "1px solid var(--line-2)" : "none" }}>
                      {isDone && <Icons.check size={12} />}
                      {isActive && <div style={{ width: 8, height: 8, borderRadius: 99, background: "#8B7DFB", animation: "rc-pulse 1s infinite" }} />}
                      {!isDone && !isActive && <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{i + 1}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: !isDone && !isActive ? "var(--ink-2)" : "var(--ink-0)" }}>{s.n}</div>
                      {s.sub && <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 1 }}>{s.sub}</div>}
                    </div>
                    {isActive && (
                      <div style={{ width: 120, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                        <div className="rc-shimmer-line" style={{ width: "100%", height: "100%" }} />
                      </div>
                    )}
                    {isDone && <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="rc-mono">0.6s</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--ink-3)" }}>This usually takes about 4 seconds. Your report will open automatically.</div>
        </div>
      </div>
    </AppShell>
  );
}
