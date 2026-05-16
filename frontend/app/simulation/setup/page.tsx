"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { Waveform } from "@/components/ui/Waveform";
import { useSimulationStore } from "@/stores/simulationStore";
import { cameraStreamRef } from "@/lib/cameraStream";
import { PRIVACY_NOTICE } from "@/lib/constants";

const CHECKS = [
  { n: "Camera connected", d: "FaceTime HD · 1080p", s: "ok" as const },
  { n: "Microphone connected", d: "MacBook Pro · 90% input", s: "ok" as const },
  { n: "Speaker connected", d: "MacBook Pro speakers", s: "ok" as const },
  { n: "Lighting check", d: "Sufficient · face well lit", s: "ok" as const },
  { n: "Background check", d: "Slight motion detected — consider blur", s: "warn" as const },
  { n: "Network", d: "45 Mbps · low latency", s: "ok" as const },
];

export default function SetupPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camOk, setCamOk] = useState(false);
  const [camError, setCamError] = useState(false);
  const store = useSimulationStore();
  const personaName = store.persona?.name || "Margaret Lewis";
  const personaRole = store.persona?.role || "post-discharge patient";

  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" }, audio: true })
      .then(s => {
        stream = s;
        cameraStreamRef.set(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        setCamOk(true);
      })
      .catch(() => setCamError(true));

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleJoin = () => {
    store.startCall();
    router.push("/simulation/call");
  };

  return (
    <AppShell>
      <TopNav active="Simulations" compact />
      <div style={{ flex: 1, padding: "28px 28px", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, overflow: "hidden" }}>
        {/* Camera preview */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 16 }}>
            <div className="rc-label" style={{ marginBottom: 6 }}>Pre-call check</div>
            <h1 className="rc-h-1" style={{ margin: 0 }}>Get ready for your simulation</h1>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 6 }}>
              You&apos;ll be on a call with <span style={{ color: "var(--ink-0)" }}>{personaName}</span>, a {personaRole.toLowerCase()}. Take a breath.
            </div>
          </div>

          <div className="rc-glass-2" style={{ position: "relative", flex: 1, borderRadius: 18, overflow: "hidden", background: "#0A0E1A" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 70% at 50% 60%, #2C3454 0%, #0F1424 100%)" }} />
            {camOk ? (
              <video ref={videoRef} autoPlay muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--ink-2)", fontSize: 13 }}>
                {camError ? "Camera access denied — please allow camera in browser settings." : "Requesting camera access…"}
              </div>
            )}

            {/* Landmark overlay */}
            <svg viewBox="0 0 600 400" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <g stroke="rgba(45,212,191,0.55)" strokeWidth="1" fill="none">
                <ellipse cx="300" cy="200" rx="85" ry="100" />
                <circle cx="278" cy="180" r="6" /><circle cx="322" cy="180" r="6" />
                <path d="M 290 220 Q 300 230 310 220" /><path d="M 300 195 L 300 215" />
              </g>
              {[[240,170],[260,165],[340,165],[360,170],[220,210],[380,210],[290,250],[310,250],[260,275],[340,275],[300,235]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="2" fill="#2DD4BF"/>)}
            </svg>

            <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>
              <div className="rc-pill teal"><span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4BF", display: "inline-block", animation: "rc-pulse 1.4s infinite" }} />Camera test</div>
              {camOk && <div className="rc-pill"><Icons.eye size={10} />Face detected</div>}
              <div className="rc-pill"><Icons.signal size={10} />Lighting · good</div>
            </div>
            <div style={{ position: "absolute", bottom: 14, left: 14, fontSize: 12, padding: "5px 10px", background: "rgba(0,0,0,0.55)", borderRadius: 8 }}>You · Alex Kim</div>
            <div style={{ position: "absolute", bottom: 14, right: 14, display: "flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.55)", padding: "5px 12px", borderRadius: 8 }}>
              <Icons.mic size={12} />
              <Waveform tone="teal" bars={14} height={16} dense />
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "12px 16px", display: "flex", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", borderRadius: 12 }}>
            <button className="rc-btn" style={{ padding: "8px 14px" }}><Icons.mic size={16} /></button>
            <button className="rc-btn" style={{ padding: "8px 14px" }}><Icons.cam size={16} /></button>
            <button className="rc-btn" style={{ padding: "8px 14px" }}><Icons.signal size={16} />Blur</button>
            <button className="rc-btn" style={{ padding: "8px 14px" }}><Icons.eye size={16} />Signals</button>
            <div style={{ flex: 1 }} />
            <button className="rc-btn ghost"><Icons.cog size={14} />Settings</button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="rc-glass" style={{ padding: 18 }}>
            <div className="rc-label" style={{ marginBottom: 12 }}>System check</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CHECKS.map(x => (
                <div key={x.n} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "grid", placeItems: "center", flexShrink: 0, background: x.s === "ok" ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)", color: x.s === "ok" ? "#6EE7B7" : "#FCD34D" }}>
                    {x.s === "ok" ? <Icons.check size={12} /> : <Icons.warn size={12} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{x.n}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{x.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rc-glass" style={{ padding: 18 }}>
            <div className="rc-label" style={{ marginBottom: 10 }}>Consent &amp; privacy</div>
            <div style={{ fontSize: 12, color: "var(--ink-1)", lineHeight: 1.55, marginBottom: 12, padding: "10px 12px", background: "rgba(79,124,255,0.06)", border: "1px solid rgba(79,124,255,0.25)", borderRadius: 10 }}>
              {PRIVACY_NOTICE}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                { key: "consentVideoSignals", label: "Allow video signal analysis" },
                { key: "consentAudioSignals", label: "Allow audio signal analysis" },
                { key: "consentSaveRecording", label: "Save recording for review" },
                { key: "consentSaveTranscript", label: "Save transcript" },
              ] as const).map(({ key, label }) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                  <span>{label}</span>
                  <button
                    onClick={() => store.setConsent(key, !store[key])}
                    style={{ width: 32, height: 18, borderRadius: 99, background: store[key] ? "linear-gradient(90deg,#2DD4BF,#8B7DFB)" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", border: "none", padding: 0 }}
                  >
                    <div style={{ position: "absolute", top: 2, left: store[key] ? 16 : 2, width: 14, height: 14, borderRadius: 99, background: "#fff", transition: "left .15s" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="rc-btn accent lg" style={{ justifyContent: "center" }} onClick={handleJoin}>
            <Icons.video size={14} /> Join simulation
          </button>
          <button className="rc-btn ghost" style={{ justifyContent: "center" }}>Switch to voice-only</button>
        </div>
      </div>
    </AppShell>
  );
}
