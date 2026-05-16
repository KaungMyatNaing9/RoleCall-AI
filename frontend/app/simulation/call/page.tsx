"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { Waveform } from "@/components/ui/Waveform";
import { Icons } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { useSimulationStore } from "@/stores/simulationStore";
import { cameraStreamRef } from "@/lib/cameraStream";
import { MOCK_TRANSCRIPT } from "@/lib/constants";
import { formatTime, timestampToMs } from "@/lib/utils";

function CtrlBtn({ icon, label, tone, onClick }: { icon: React.ReactNode; label: string; tone?: string; onClick?: () => void }) {
  const toneStyle = tone === "violet" ? { background: "rgba(139,125,251,0.18)", color: "#B5ACFD", borderColor: "rgba(139,125,251,0.4)" }
    : tone === "amber" ? { background: "rgba(251,191,36,0.14)", color: "#FCD34D", borderColor: "rgba(251,191,36,0.35)" } : {};
  return (
    <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 12px", minWidth: 62, background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", borderRadius: 12, color: "var(--ink-0)", cursor: "pointer", transition: "background .15s", ...toneStyle }}>
      {icon}<span style={{ fontSize: 10 }}>{label}</span>
    </button>
  );
}

function Signal({ label, v, tone = "violet", raw }: { label: string; v: number; tone?: string; raw?: string }) {
  const colors: Record<string, string> = { ok: "#6EE7B7", warn: "#FCD34D", bad: "#FCA5A5", violet: "#B5ACFD", teal: "#5EEAD4" };
  const c = colors[tone] || colors.violet;
  return (
    <div style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", borderRadius: 8 }}>
      <div style={{ fontSize: 10, color: "var(--ink-3)", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: c }} className="rc-mono">{raw || `${v}%`}</span>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: 3, height: 8 + i * 1.5, borderRadius: 1, background: i <= Math.round(v / 20) ? c : "rgba(255,255,255,0.1)" }} />)}
        </div>
      </div>
    </div>
  );
}

export default function CallPage() {
  const router = useRouter();
  const store = useSimulationStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [visibleTranscript, setVisibleTranscript] = useState<typeof MOCK_TRANSCRIPT>([]);
  const [criticalVisible, setCriticalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [personaTalking, setPersonaTalking] = useState(false);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Attach camera stream
  useEffect(() => {
    const stream = cameraStreamRef.get();
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Timed transcript playback
  useEffect(() => {
    const callStart = Date.now();
    MOCK_TRANSCRIPT.forEach(entry => {
      const ms = timestampToMs(entry.timestamp);
      const t = setTimeout(() => {
        setPersonaTalking(true);
        setVisibleTranscript(prev => [...prev, entry]);
        if (entry.is_critical) {
          setCriticalVisible(true);
          setTimeout(() => setCriticalVisible(false), 15000);
        }
        setTimeout(() => setPersonaTalking(false), 3000);
      }, ms);
      timeoutRefs.current.push(t);
    });
    return () => timeoutRefs.current.forEach(clearTimeout);
  }, []);

  const handleEndCall = useCallback(() => {
    cameraStreamRef.stop();
    store.endCall();
    router.push("/analyzing");
  }, [router, store]);

  const latestLine = visibleTranscript[visibleTranscript.length - 1];
  const progress = Math.min(elapsed / 300, 1);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#06080F", display: "flex", flexDirection: "column", zIndex: 100 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />

      {/* Status bar */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", background: "rgba(0,0,0,0.55)", borderBottom: "1px solid var(--line)", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={20} />
          <div style={{ width: 1, height: 18, background: "var(--line)" }} />
          <div className="rc-pill teal">
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4BF", display: "inline-block", animation: "rc-pulse 1.4s infinite" }} />LIVE
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Post-discharge patient · Margaret Lewis</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Healthcare · Medium</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>SCENARIO</span>
            <div style={{ width: 120, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${progress * 100}%`, height: "100%", background: "linear-gradient(90deg,#2DD4BF,#8B7DFB)" }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 500 }} className="rc-mono">{Math.round(progress * 100)}%</span>
          </div>
          <div style={{ width: 1, height: 18, background: "var(--line)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }} className="rc-mono">
            <Icons.clock size={12} /><span style={{ color: "#5EEAD4" }}>{formatTime(elapsed)}</span><span style={{ color: "var(--ink-3)" }}>/ 05:00</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", minHeight: 0 }}>
        {/* Main video area */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", flex: 1, padding: "22px 22px 0" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 18, overflow: "hidden", background: "linear-gradient(160deg, #1A2540 0%, #0A1226 60%, #0E1A2C 100%)", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)" }}>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <div style={{ transform: "scale(2.6)" }}>
                  <PersonaAvatar persona="margaret" size={200} mood="worried" talking={personaTalking} />
                </div>
              </div>

              {/* Persona info */}
              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(0,0,0,0.55)", border: "1px solid var(--line-2)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                  <PersonaAvatar persona="margaret" size={34} mood="worried" />
                  <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>Margaret Lewis</div><div style={{ fontSize: 11, color: "var(--ink-2)" }}>Patient · 72</div></div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="rc-pill warn"><span style={{ width: 6, height: 6, borderRadius: 99, background: "#FCD34D", display: "inline-block" }} />Worried</div>
                  <div className="rc-pill">Polite</div>
                </div>
              </div>

              {/* Speaking indicator */}
              {personaTalking && (
                <div style={{ position: "absolute", bottom: 16, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(0,0,0,0.55)", border: "1px solid var(--line-2)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "#2DD4BF", animation: "rc-pulse 1s infinite" }} />
                  <span style={{ fontSize: 12, color: "#5EEAD4", fontWeight: 500 }}>Speaking</span>
                  <Waveform tone="teal" bars={16} height={14} dense />
                </div>
              )}

              {/* Caption */}
              {latestLine && (
                <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", maxWidth: "70%", padding: "12px 18px", background: "rgba(0,0,0,0.65)", borderRadius: 14, border: "1px solid var(--line-2)", backdropFilter: "blur(20px)", fontSize: 14.5, lineHeight: 1.5, fontStyle: "italic", textAlign: "center" }}>
                  {latestLine.is_critical
                    ? <>{'"…and I felt this '}<span style={{ background: "rgba(248,113,113,0.25)", padding: "1px 5px", borderRadius: 4, fontStyle: "normal", color: "#FCA5A5", fontWeight: 500 }}>tightness in my chest</span>{', but I wasn\'t sure…"'}</>
                    : `"${latestLine.text}"`
                  }
                </div>
              )}

              {/* Critical moment banner */}
              {criticalVisible && (
                <div style={{ position: "absolute", top: 16, right: 16, width: 280, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(180deg, rgba(248,113,113,0.18), rgba(248,113,113,0.06))", border: "1px solid rgba(248,113,113,0.5)", boxShadow: "0 0 30px -5px rgba(248,113,113,0.4)", backdropFilter: "blur(20px)", animation: "rc-floaty 3s ease-in-out infinite" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(248,113,113,0.25)", display: "grid", placeItems: "center", color: "#FCA5A5" }}><Icons.warn size={12} /></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FCA5A5", letterSpacing: "0.02em" }}>CRITICAL MOMENT DETECTED</div>
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-0)" }}>Patient revealed a potential red flag. Consider acknowledging and escalating before continuing.</div>
                </div>
              )}

              {/* User PIP */}
              <div style={{ position: "absolute", bottom: 14, right: 14, width: 200, height: 140, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line-2)", background: "linear-gradient(160deg, #1A2540 0%, #0E1A2C 100%)", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.5)" }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <svg viewBox="0 0 200 140" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.55 }}>
                  <g stroke="rgba(45,212,191,0.6)" strokeWidth="0.8" fill="none"><ellipse cx="100" cy="68" rx="34" ry="42" /></g>
                  {[[88,58],[112,58],[100,75],[90,90],[110,90]].map(([x,y],i) => <circle key={i} cx={x} cy={y} r="1.5" fill="#2DD4BF"/>)}
                </svg>
                <div style={{ position: "absolute", top: 8, left: 8, fontSize: 10, padding: "2px 7px", background: "rgba(0,0,0,0.55)", borderRadius: 6 }}>You</div>
                <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, background: "rgba(0,0,0,0.55)", borderRadius: 6, display: "grid", placeItems: "center", color: "#5EEAD4" }}><Icons.mic size={10} /></div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px", background: "linear-gradient(0deg, rgba(0,0,0,0.8), transparent)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
                  <span style={{ color: "#5EEAD4" }} className="rc-mono">EYE 62%</span>
                  <span style={{ color: "#FCD34D" }} className="rc-mono">PACE FAST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: "18px 22px 22px", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(0,0,0,0.6)", border: "1px solid var(--line-2)", borderRadius: 18, backdropFilter: "blur(20px)", boxShadow: "0 14px 40px -10px rgba(0,0,0,0.7)" }}>
              <CtrlBtn icon={<Icons.mic size={18} />} label="Mute" onClick={store.toggleMute} />
              <CtrlBtn icon={<Icons.cam size={18} />} label="Camera" onClick={store.toggleCamera} />
              <CtrlBtn icon={<Icons.hint size={18} />} label="Hint" tone="violet" />
              <CtrlBtn icon={<Icons.bookmark size={18} />} label="Mark" />
              <CtrlBtn icon={<Icons.pause size={18} />} label="Pause" />
              <div style={{ width: 1, height: 32, background: "var(--line)" }} />
              <CtrlBtn icon={<Icons.retry size={18} />} label="Reset" />
              <CtrlBtn icon={<Icons.warn size={18} />} label="Emergency" tone="amber" />
              <button className="rc-btn danger" style={{ padding: "10px 16px", borderRadius: 14, marginLeft: 6 }} onClick={handleEndCall}>
                <Icons.phone size={16} /> End call
              </button>
            </div>
          </div>
        </div>

        {/* Coaching panel */}
        <div style={{ background: "rgba(10,14,26,0.7)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", backdropFilter: "blur(20px)" }}>
          <div style={{ padding: "14px 16px 0", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="rc-label">Coaching</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#5EEAD4" }}>
                <Icons.sparkle size={10} /> Coach Mode
                <div style={{ width: 28, height: 16, borderRadius: 99, background: "linear-gradient(90deg,#2DD4BF,#8B7DFB)", position: "relative" }}>
                  <div style={{ position: "absolute", top: 1, left: 13, width: 14, height: 14, borderRadius: 99, background: "#fff" }} />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {["Live Notes", "Transcript", "Rubric", "Signals", "Hints"].map((t, i) => (
                <div key={t} onClick={() => setActiveTab(i)} style={{ padding: "8px 11px", fontSize: 12, fontWeight: i === activeTab ? 600 : 500, color: i === activeTab ? "var(--ink-0)" : "var(--ink-2)", borderBottom: i === activeTab ? "2px solid #8B7DFB" : "2px solid transparent", marginBottom: -1, cursor: "pointer" }}>{t}</div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, padding: "14px 16px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 12 }}>
            {criticalVisible && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "linear-gradient(180deg, rgba(248,113,113,0.16), rgba(248,113,113,0.04))", border: "1px solid rgba(248,113,113,0.5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Icons.warn size={12} />
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: "#FCA5A5", letterSpacing: "0.05em" }}>SUGGESTED RESPONSE · NOW</div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-0)", fontStyle: "italic" }}>
                  "Because you mentioned chest tightness after surgery, I need to connect you with urgent clinical support right now."
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="rc-btn sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => setCriticalVisible(false)}>Dismiss</button>
                  <button className="rc-btn sm primary" style={{ flex: 1, justifyContent: "center" }}>Use phrasing</button>
                </div>
              </div>
            )}

            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { t: "03:18", c: "warn", m: "Patient mentioned dizziness 30 seconds ago — circle back." },
                { t: "03:01", c: "ok", m: "Good clarifying question on medication timing." },
                { t: "02:42", c: "violet", m: "Consider summarizing what you've heard so far." },
                { t: "02:28", c: "ok", m: "Strong empathy (\"I hear how scary that must feel\")." },
                { t: "02:05", c: "warn", m: "Avoid interrupting — let the patient finish." },
                { t: "01:48", c: "info", m: "Try open questions: \"What's been worrying you most?\"" },
              ].map((n, i) => (
                <div key={i} style={{ display: "flex", gap: 9, fontSize: 12, lineHeight: 1.5 }}>
                  <div style={{ fontSize: 10, color: "var(--ink-3)", width: 32, paddingTop: 2 }} className="rc-mono">{n.t}</div>
                  <div style={{ width: 18, height: 18, borderRadius: 99, flexShrink: 0, background: n.c === "ok" ? "rgba(52,211,153,0.18)" : n.c === "warn" ? "rgba(251,191,36,0.18)" : n.c === "violet" ? "rgba(139,125,251,0.18)" : "rgba(79,124,255,0.18)", color: n.c === "ok" ? "#6EE7B7" : n.c === "warn" ? "#FCD34D" : n.c === "violet" ? "#B5ACFD" : "#93B4FF", display: "grid", placeItems: "center" }}>
                    <Icons.warn size={10} />
                  </div>
                  <div style={{ flex: 1, color: "var(--ink-1)" }}>{n.m}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
              <div className="rc-label" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                <span>Nonverbal signals</span>
                <span style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "none", letterSpacing: "normal" }}>coaching estimates</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Signal label="Eye contact" v={62} tone="warn" />
                <Signal label="Pace" v={78} tone="warn" raw="168 wpm" />
                <Signal label="Engagement" v={84} tone="ok" />
                <Signal label="Turn-taking" v={71} tone="violet" />
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: "var(--ink-3)", marginTop: 10 }} className="rc-mono">
                <span>3 interruptions</span><span>·</span><span>4 clarifiers</span><span>·</span><span>12 fillers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript dock */}
      <div style={{ position: "absolute", bottom: 104, left: 22, width: 380, padding: "12px 14px", borderRadius: 14, background: "rgba(0,0,0,0.6)", border: "1px solid var(--line-2)", backdropFilter: "blur(20px)", boxShadow: "0 12px 30px -10px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div className="rc-label" style={{ fontSize: 9.5 }}>Live transcript</div>
          <div className="rc-pill" style={{ fontSize: 10 }}><Icons.dot /> Auto-scroll</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12 }}>
          {visibleTranscript.slice(-3).map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 8, opacity: i === Math.min(2, visibleTranscript.length - 1) ? 1 : 0.85 }}>
              <span style={{ fontSize: 10, color: "var(--ink-3)", width: 32, flexShrink: 0, paddingTop: 1 }} className="rc-mono">{l.timestamp}</span>
              <span style={{ color: l.speaker === "patient" ? "#FCD34D" : "#5EEAD4", fontWeight: 500, width: 54, flexShrink: 0, fontSize: 11.5 }}>{l.speaker === "patient" ? "Patient:" : "You:"}</span>
              <span style={{ color: "var(--ink-1)", lineHeight: 1.4 }}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
