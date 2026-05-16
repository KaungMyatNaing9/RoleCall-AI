"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useConversation } from "@elevenlabs/react";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { Waveform } from "@/components/ui/Waveform";
import { Icons } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { useSimulationStore } from "@/stores/simulationStore";
import { cameraStreamRef } from "@/lib/cameraStream";
import { api } from "@/lib/apiClient";
import { formatTime, scoreToTone } from "@/lib/utils";
import { useVideoSignals } from "@/lib/useVideoSignals";

type AvatarPreset = "margaret" | "james" | "elena" | "david" | "aanya" | "user";
type MoodPreset = "worried" | "angry" | "neutral" | "upbeat" | "confused";

const AVATAR_MAP: Record<string, AvatarPreset> = {
  elderly_woman: "margaret", elderly_man: "david",
  middle_aged_woman: "elena", middle_aged_man: "james",
  young_woman: "aanya", young_man: "james",
  margaret: "margaret", james: "james", elena: "elena", david: "david", aanya: "aanya",
};
const MOOD_SET = new Set(["worried", "angry", "neutral", "upbeat", "confused"]);

const CRITICAL_KEYWORDS = [
  "chest", "tightness", "pain", "heart", "dizzy", "faint",
  "bleeding", "breathing", "emergency", "unconscious", "severe", "stroke",
  "can't breathe", "shortness", "pressure",
];
function hasCriticalKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return CRITICAL_KEYWORDS.some(kw => lower.includes(kw));
}

function toAvatarPreset(s: string): AvatarPreset { return AVATAR_MAP[s] ?? "margaret"; }
function toMoodPreset(s: string): MoodPreset { return MOOD_SET.has(s) ? (s as MoodPreset) : "neutral"; }

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

type TranscriptEntry = { speaker: string; timestamp: string; text: string; is_critical: boolean };

export default function CallPage() {
  const router = useRouter();
  const store = useSimulationStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const elapsedRef = useRef(0);
  const [visibleTranscript, setVisibleTranscript] = useState<TranscriptEntry[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const persona = store.persona;
  const scenario = store.scenario;
  const avatarPreset = toAvatarPreset(persona?.avatar_preset ?? "margaret");
  const moodPreset = toMoodPreset(persona?.mood ?? "neutral");

  const conversation = useConversation({
    onMessage: ({ message, source }: { message: string; source: string }) => {
      const entry: TranscriptEntry = {
        speaker: source === "ai" ? "patient" : "user",
        timestamp: formatTime(elapsedRef.current),
        text: message,
        is_critical: false,
      };
      setVisibleTranscript(prev => [...prev, entry]);
      store.addTranscriptEntry(entry);
      if (source === "ai" && hasCriticalKeyword(message)) {
        store.triggerCriticalMoment(message);
      }
    },
    onError: (error: string) => console.error("ElevenLabs error:", error),
  });

  // Keep a ref so cleanup can call endSession without stale closure
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  // Capture and analyse a frame every 3 s
  useVideoSignals(videoRef, store.simulationId ?? "call-session");

  // Attach camera stream
  useEffect(() => {
    const stream = cameraStreamRef.get();
    if (stream && videoRef.current) videoRef.current.srcObject = stream;
  }, []);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(e => {
        const next = e + 1;
        elapsedRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Start ElevenLabs session using agentId from store
  useEffect(() => {
    const agentId = store.agentId;
    if (!agentId) return;

    let active = true;
    (async () => {
      try {
        const { signed_url } = await api.getSignedUrl(agentId);
        if (!active) return;
        await conversationRef.current.startSession({ signedUrl: signed_url });
      } catch (err) {
        console.error("Failed to start ElevenLabs session:", err);
      }
    })();

    return () => {
      active = false;
      conversationRef.current.endSession().catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEndCall = useCallback(async () => {
    try { await conversationRef.current.endSession(); } catch {}
    cameraStreamRef.stop();
    store.endCall();
    router.push("/analyzing");
  }, [router, store]);

  const handleToggleMute = useCallback(() => {
    const newMuted = !store.isMuted;
    store.toggleMute();
    conversation.setInputMuted(newMuted);
  }, [store, conversation]);

  const sigs = store.liveSignals;
  const eyeV  = Math.round(sigs.eye_contact_estimate * 100);
  const engV  = Math.round(sigs.facial_engagement_estimate * 100);
  const stabV = Math.round(sigs.head_movement_stability * 100);
  const paceV = Math.max(0, Math.min(100, 100 - Math.abs(sigs.speaking_pace_wpm - 135) * 1.5));

  const latestLine = visibleTranscript[visibleTranscript.length - 1];
  const progress = Math.min(elapsed / 300, 1);
  const personaLabel = persona ? `${persona.role} · ${persona.name}` : "Simulation active";
  const contextLabel = scenario ? `${scenario.industry} · ${scenario.difficulty}` : "";

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
          <div style={{ fontSize: 13, fontWeight: 500 }}>{personaLabel}</div>
          {contextLabel && <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{contextLabel}</div>}
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
                  <PersonaAvatar persona={avatarPreset} size={200} mood={moodPreset} talking={conversation.isSpeaking} />
                </div>
              </div>

              {/* Persona info */}
              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(0,0,0,0.55)", border: "1px solid var(--line-2)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                  <PersonaAvatar persona={avatarPreset} size={34} mood={moodPreset} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{persona?.name ?? "Persona"}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-2)" }}>{persona ? `${persona.role} · ${persona.age}` : ""}</div>
                  </div>
                </div>
                {persona && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <div className="rc-pill warn"><span style={{ width: 6, height: 6, borderRadius: 99, background: "#FCD34D", display: "inline-block" }} />{persona.mood}</div>
                    {persona.traits.slice(0, 1).map(t => <div key={t} className="rc-pill">{t}</div>)}
                  </div>
                )}
              </div>

              {/* Speaking indicator */}
              {conversation.isSpeaking && (
                <div style={{ position: "absolute", bottom: 16, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(0,0,0,0.55)", border: "1px solid var(--line-2)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "#2DD4BF", animation: "rc-pulse 1s infinite" }} />
                  <span style={{ fontSize: 12, color: "#5EEAD4", fontWeight: 500 }}>Speaking</span>
                  <Waveform tone="teal" bars={16} height={14} dense />
                </div>
              )}

              {/* Caption */}
              {latestLine && (
                <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", maxWidth: "70%", padding: "12px 18px", background: "rgba(0,0,0,0.65)", borderRadius: 14, border: "1px solid var(--line-2)", backdropFilter: "blur(20px)", fontSize: 14.5, lineHeight: 1.5, fontStyle: "italic", textAlign: "center" }}>
                  {`"${latestLine.text}"`}
                </div>
              )}

              {/* Critical moment banner */}
              {store.criticalMomentVisible && (
                <div style={{ position: "absolute", top: 16, right: 16, width: 280, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(180deg, rgba(248,113,113,0.18), rgba(248,113,113,0.06))", border: "1px solid rgba(248,113,113,0.5)", boxShadow: "0 0 30px -5px rgba(248,113,113,0.4)", backdropFilter: "blur(20px)", animation: "rc-floaty 3s ease-in-out infinite" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(248,113,113,0.25)", display: "grid", placeItems: "center", color: "#FCA5A5" }}><Icons.warn size={12} /></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FCA5A5", letterSpacing: "0.02em" }}>CRITICAL MOMENT DETECTED</div>
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-0)" }}>{store.criticalMomentMessage ? `"${store.criticalMomentMessage.slice(0, 110)}${store.criticalMomentMessage.length > 110 ? "…" : ""}" — consider escalating.` : "Patient revealed a potential red flag. Consider acknowledging and escalating before continuing."}</div>
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
                <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, background: store.isMuted ? "rgba(248,113,113,0.4)" : "rgba(0,0,0,0.55)", borderRadius: 6, display: "grid", placeItems: "center", color: store.isMuted ? "#FCA5A5" : "#5EEAD4" }}>
                  <Icons.mic size={10} />
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "6px 8px", background: "linear-gradient(0deg, rgba(0,0,0,0.8), transparent)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}>
                  <span className="rc-mono" style={{ color: eyeV >= 80 ? "#6EE7B7" : eyeV >= 65 ? "#FCD34D" : "#FCA5A5" }}>EYE {eyeV}%</span>
                  <span className="rc-mono" style={{ color: sigs.speaking_pace_wpm > 170 ? "#FCA5A5" : sigs.speaking_pace_wpm > 155 ? "#FCD34D" : "#6EE7B7" }}>{sigs.speaking_pace_wpm} WPM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: "18px 22px 22px", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(0,0,0,0.6)", border: "1px solid var(--line-2)", borderRadius: 18, backdropFilter: "blur(20px)", boxShadow: "0 14px 40px -10px rgba(0,0,0,0.7)" }}>
              <CtrlBtn icon={<Icons.mic size={18} />} label={store.isMuted ? "Unmute" : "Mute"} tone={store.isMuted ? "amber" : undefined} onClick={handleToggleMute} />
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
            {store.criticalMomentVisible && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: "linear-gradient(180deg, rgba(248,113,113,0.16), rgba(248,113,113,0.04))", border: "1px solid rgba(248,113,113,0.5)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <Icons.warn size={12} />
                  <div style={{ fontSize: 10.5, fontWeight: 600, color: "#FCA5A5", letterSpacing: "0.05em" }}>SUGGESTED RESPONSE · NOW</div>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-0)", fontStyle: "italic" }}>
                  "Because you mentioned chest tightness after surgery, I need to connect you with urgent clinical support right now."
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="rc-btn sm" style={{ flex: 1, justifyContent: "center" }} onClick={store.dismissCriticalMoment}>Dismiss</button>
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
                <Signal label="Eye contact" v={eyeV} tone={scoreToTone(eyeV)} />
                <Signal label="Pace" v={Math.round(paceV)} tone={scoreToTone(paceV)} raw={`${sigs.speaking_pace_wpm} wpm`} />
                <Signal label="Engagement" v={engV} tone={scoreToTone(engV)} />
                <Signal label="Turn-taking" v={stabV} tone={scoreToTone(stabV)} />
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: "var(--ink-3)", marginTop: 10 }} className="rc-mono">
                <span>{sigs.interruption_count} interruptions</span><span>·</span><span>4 clarifiers</span><span>·</span><span>{sigs.filler_word_count} fillers</span>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12, minHeight: 40 }}>
          {visibleTranscript.length === 0 ? (
            <div style={{ color: "var(--ink-3)", fontSize: 11, fontStyle: "italic" }}>
              {store.agentId ? "Connecting to agent…" : "Waiting for conversation…"}
            </div>
          ) : visibleTranscript.slice(-3).map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 8, opacity: i === Math.min(2, visibleTranscript.length - 1) ? 1 : 0.85 }}>
              <span style={{ fontSize: 10, color: "var(--ink-3)", width: 32, flexShrink: 0, paddingTop: 1 }} className="rc-mono">{l.timestamp}</span>
              <span style={{ color: l.speaker === "patient" ? "#FCD34D" : "#5EEAD4", fontWeight: 500, width: 54, flexShrink: 0, fontSize: 11.5 }}>{l.speaker === "patient" ? (persona?.name?.split(" ")[0] ?? "Patient") + ":" : "You:"}</span>
              <span style={{ color: "var(--ink-1)", lineHeight: 1.4 }}>{l.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
