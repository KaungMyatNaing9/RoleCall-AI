"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useSimulationStore } from "@/stores/simulationStore";
import { api } from "@/lib/apiClient";
import { finalizeSessionSignals } from "@/lib/finalizeSession";

export default function AnalyzingPage() {
  const router = useRouter();
  const store = useSimulationStore();
  const [status, setStatus] = useState<"analyzing" | "error">("analyzing");
  const storeRef = useRef(store);
  storeRef.current = store;

  useEffect(() => {
    const s = storeRef.current;
    const sessionId = s.simulationId || `session-${Date.now()}`;

    async function run() {
      let transcript = s.transcript.map((entry) => ({
        speaker: entry.speaker,
        text: entry.text,
        timestamp: entry.timestamp,
      }));

      if (!transcript.length) {
        try {
          const remote = await api.getSessionTranscript(sessionId);
          transcript = remote.map((entry) => ({
            speaker: entry.speaker,
            text: entry.text,
            timestamp: "",
          }));
        } catch {
          // Keep empty transcript; backend may still return a mock report.
        }
      }

      const needsSignalFinalize =
        !s.sessionSignalsFinalized &&
        !s.sessionVideoSignals &&
        !s.sessionAudioSignals;

      if (needsSignalFinalize) {
        try {
          const durationS =
            s.sessionDurationS ?? Math.max(60, transcript.length * 45);
          const signals = await finalizeSessionSignals({
            sessionId,
            durationS,
            transcript,
            consentVideo: s.consentVideoSignals && (s.mode ?? "video") === "video",
            consentAudio: s.consentAudioSignals,
          });
          storeRef.current.setSessionSignals(signals.video, signals.audio);
          storeRef.current.markSessionSignalsFinalized();
        } catch {
          // Non-fatal if summarize endpoints fail.
        }
      }

      return api.generateEvaluation({
        session_id: sessionId,
        persona_id: s.persona?.id ?? "persona-margaret-001",
        scenario_id: s.scenario?.id ?? "scenario-postdischarge-001",
        rubric_id: s.rubric?.id ?? "rubric-healthcare-001",
        mode: s.mode ?? "video",
        transcript,
      });
    }

    run()
      .then((report) => {
        storeRef.current.setReport(report);
        router.push("/simulation/report");
      })
      .catch(() => setStatus("error"));
  }, [router]);

  if (status === "error") {
    return (
      <AppShell>
        <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 28, textAlign: "center" }}>
          <h2 className="rc-h-2" style={{ margin: "0 0 8px" }}>Could not generate report</h2>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24 }}>
            Your transcript is still saved. You can open the last report or try again.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button type="button" className="rc-btn ghost" onClick={() => setStatus("analyzing")}>
              Retry
            </button>
            <button type="button" className="rc-btn primary" onClick={() => router.push("/simulation/report")}>
              Open report
            </button>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 28 }}>
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 99,
              border: "2px solid rgba(255,255,255,0.2)",
              borderTopColor: "#8B7DFB",
              display: "inline-block",
              animation: "rc-spin 1s linear infinite",
              marginBottom: 20,
            }}
          />
          <h1 className="rc-h-2" style={{ margin: 0 }}>Building your report</h1>
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 8 }}>
            Summarizing session signals and coaching feedback…
          </p>
        </div>
      </main>
    </AppShell>
  );
}
