"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { Waveform } from "@/components/ui/Waveform";
import { Icons } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { useSimulationStore } from "@/stores/simulationStore";
import { cameraStreamRef } from "@/lib/cameraStream";
import { formatTime, timestampToMs } from "@/lib/utils";
import { api, type PersonaResponse, type TranscriptEntry } from "@/lib/apiClient";

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

const DEMO_TIMESTAMPS = ["00:15", "00:52", "01:30", "02:10", "02:41", "03:15", "04:00", "04:50"];

function buildDemoTranscript(persona: PersonaResponse | null): TranscriptEntry[] {
  const fallback = [
    "Hi, I need some help with this situation.",
    "I want to make sure I understand what happens next.",
    "I may have left out an important detail earlier.",
    "Can you walk me through this step by step?",
  ];
  const lines = (persona?.sample_lines?.length ? persona.sample_lines : fallback).slice(0, DEMO_TIMESTAMPS.length);
  const redFlagHint = (persona?.hidden_red_flag || "").toLowerCase();

  return lines.map((text, index) => {
    const lower = text.toLowerCase();
    const isCritical = Boolean(
      redFlagHint && (
        lower.includes(redFlagHint.split("—")[0].trim()) ||
        lower.includes(redFlagHint.split("-")[0].trim()) ||
        lower.includes("chest tightness") ||
        lower.includes("shortness of breath") ||
        lower.includes("suicid") ||
        lower.includes("fraud") ||
        lower.includes("unsafe")
      ),
    );
    return {
      speaker: "patient",
      timestamp: DEMO_TIMESTAMPS[index] || DEMO_TIMESTAMPS[DEMO_TIMESTAMPS.length - 1],
      text,
      is_critical: isCritical,
    };
  });
}

export default function CallPage() {
  const router = useRouter();
  const store = useSimulationStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [visibleTranscript, setVisibleTranscript] = useState<TranscriptEntry[]>([]);
  const [criticalVisible, setCriticalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [personaTalking, setPersonaTalking] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [draftReply, setDraftReply] = useState("");
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mode = store.mode || "video";
  const isVideoMode = mode === "video";
  const isVoiceMode = mode === "voice";
  const isPhoneMode = mode === "phone";
  const isTextMode = mode === "text";
  const persona = store.persona || {
    id: "persona-margaret-001",
    name: "Margaret Lewis",
    age: 72,
    role: "Post-discharge patient",
    mood: "worried",
    traits: ["polite", "hesitant", "apologetic"],
    goal: "Understand new medication instructions",
    hidden_red_flag: "Chest tightness — reveals only if asked about symptoms or after ~2 min",
    behavior: "Apologetic, asks to repeat, easily distracted",
    voice_style: "Elderly, calm, slightly anxious — light tremor",
    opening_line: "Hi, I'm sorry to bother you. I was discharged yesterday and I'm confused about which pills I should take tonight.",
    avatar_preset: "margaret",
    sample_lines: [],
  };

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
    const transcriptScript = buildDemoTranscript(store.persona);
    setVisibleTranscript([]);
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    transcriptScript.forEach(entry => {
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
  }, [store.persona]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const handleEndCall = useCallback(() => {
    cameraStreamRef.stop();
    store.endCall();
    router.push("/analyzing");
  }, [router, store]);

  const latestLine = visibleTranscript[visibleTranscript.length - 1];
  const progress = Math.min(elapsed / 300, 1);
  const primaryModeLabel = isPhoneMode ? "PHONE" : isTextMode ? "CHAT" : isVoiceMode ? "VOICE" : "VIDEO";
  const criticalResponse = persona.hidden_red_flag
    ? `I heard ${persona.hidden_red_flag.split("—")[0].trim().toLowerCase()}. I need to shift us into a safer next step before we continue.`
    : "I need to pause and make sure we handle that safely before we continue.";

  const handlePlayLatestLine = useCallback(async () => {
    if (!latestLine) return;
    try {
      setIsPlayingVoice(true);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      const blob = await api.synthesizeVoice({
        text: latestLine.text,
        persona_name: persona.name,
        voice_style: persona.voice_style,
      });
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingVoice(false);
      audio.onerror = () => setIsPlayingVoice(false);
      await audio.play();
    } catch {
      setIsPlayingVoice(false);
    }
  }, [latestLine, persona.name, persona.voice_style]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#06080F", display: "flex", flexDirection: "column", zIndex: 100 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />

      {/* Status bar */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", background: "rgba(0,0,0,0.55)", borderBottom: "1px solid var(--line)", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={20} />
          <div style={{ width: 1, height: 18, background: "var(--line)" }} />
          <div className="rc-pill teal">
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4BF", display: "inline-block", animation: "rc-pulse 1.4s infinite" }} />{primaryModeLabel}
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{persona.role} · {persona.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{store.industry || "Healthcare"} · {store.difficulty || "Medium"}</div>
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
              {isVideoMode && (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <div style={{ transform: "scale(2.6)" }}>
                    <PersonaAvatar persona={persona.avatar_preset as any} size={200} mood={persona.mood as any} talking={personaTalking} />
                  </div>
                </div>
              )}

              {isVoiceMode && (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <div style={{ width: 420, textAlign: "center" }}>
                    <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--ink-3)", marginBottom: 16 }}>AUDIO CHANNEL</div>
                    <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.05em", marginBottom: 8 }}>{persona.name}</div>
                    <div style={{ fontSize: 15, color: "var(--ink-2)", marginBottom: 24 }}>{persona.role} · spoken coaching mode</div>
                    <Waveform tone="teal" bars={32} height={38} dense />
                    <div style={{ marginTop: 18, display: "flex", justifyContent: "center", gap: 8 }}>
                      <div className="rc-pill teal"><Icons.mic size={10} />Voice active</div>
                      <div className="rc-pill"><Icons.chat size={10} />Transcript live</div>
                    </div>
                  </div>
                </div>
              )}

              {isPhoneMode && (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <div style={{ width: 290, borderRadius: 32, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,10,17,0.75)", padding: "28px 24px", boxShadow: "0 32px 70px -18px rgba(0,0,0,0.7)" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 16 }} className="rc-mono">LIVE PHONE CALL</div>
                      <div style={{ width: 96, height: 96, borderRadius: 99, margin: "0 auto 18px", background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.28)", display: "grid", placeItems: "center" }}>
                        <Icons.phone size={28} />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{persona.name}</div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: 20 }}>{persona.role}</div>
                      <Waveform tone="teal" bars={22} height={24} dense />
                      <div style={{ marginTop: 20, display: "grid", gap: 8, fontSize: 12, color: "var(--ink-2)" }}>
                        <div>No visual cues</div>
                        <div>Listen for detail changes</div>
                        <div>Use verbal reassurance and structure</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isTextMode && (
                <div style={{ position: "absolute", inset: 18, borderRadius: 18, border: "1px solid var(--line)", background: "rgba(8,10,17,0.78)", padding: 18, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div className="rc-pill"><Icons.chat size={10} />Live chat thread</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{persona.name} is typing in bursts</div>
                  </div>
                  <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 6 }}>
                    {visibleTranscript.map((line, index) => (
                      <div
                        key={`${line.timestamp}-${index}`}
                        style={{
                          alignSelf: line.speaker === "patient" ? "flex-start" : "flex-end",
                          maxWidth: "72%",
                          background: line.speaker === "patient" ? "rgba(255,255,255,0.05)" : "rgba(45,212,191,0.12)",
                          border: `1px solid ${line.speaker === "patient" ? "var(--line)" : "rgba(45,212,191,0.22)"}`,
                          borderRadius: 16,
                          padding: "10px 12px",
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        {line.text}
                      </div>
                    ))}
                    {!visibleTranscript.length && (
                      <div style={{ alignSelf: "flex-start", maxWidth: "72%", background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)", borderRadius: 16, padding: "10px 12px", fontSize: 13, lineHeight: 1.5 }}>
                        Waiting for the first chat message…
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                      <textarea
                        value={draftReply}
                        onChange={(e) => setDraftReply(e.target.value)}
                        placeholder="Type your next message with clear structure and calm tone..."
                        style={{ flex: 1, minHeight: 84, resize: "none", background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", borderRadius: 14, color: "var(--ink-0)", padding: "12px 14px", fontSize: 13, outline: "none" }}
                      />
                      <button className="rc-btn primary"><Icons.chat size={14} /> Send</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Persona info */}
              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(0,0,0,0.55)", border: "1px solid var(--line-2)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                  <PersonaAvatar persona={persona.avatar_preset as any} size={34} mood={persona.mood as any} />
                  <div><div style={{ fontSize: 13.5, fontWeight: 600 }}>{persona.name}</div><div style={{ fontSize: 11, color: "var(--ink-2)" }}>{persona.role} · {persona.age}</div></div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="rc-pill warn"><span style={{ width: 6, height: 6, borderRadius: 99, background: "#FCD34D", display: "inline-block" }} />{persona.mood}</div>
                  <div className="rc-pill">{persona.traits[0] || "Conversational"}</div>
                  {latestLine && !isTextMode && (
                    <button className="rc-pill" style={{ border: "none", cursor: "pointer" }} onClick={handlePlayLatestLine}>
                      {isPlayingVoice ? <Icons.pause size={10} /> : <Icons.play size={10} />} Hear line
                    </button>
                  )}
                </div>
              </div>

              {/* Speaking indicator */}
              {personaTalking && !isPhoneMode && !isTextMode && (
                <div style={{ position: "absolute", bottom: 16, left: 16, display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(0,0,0,0.55)", border: "1px solid var(--line-2)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: "#2DD4BF", animation: "rc-pulse 1s infinite" }} />
                  <span style={{ fontSize: 12, color: "#5EEAD4", fontWeight: 500 }}>Speaking</span>
                  <Waveform tone="teal" bars={16} height={14} dense />
                </div>
              )}

              {/* Caption */}
              {latestLine && !isTextMode && (
                <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", maxWidth: "70%", padding: "12px 18px", background: "rgba(0,0,0,0.65)", borderRadius: 14, border: "1px solid var(--line-2)", backdropFilter: "blur(20px)", fontSize: 14.5, lineHeight: 1.5, fontStyle: "italic", textAlign: "center" }}>
                  {latestLine.is_critical ? <span style={{ color: "#FCA5A5" }}>"{latestLine.text}"</span> : `"${latestLine.text}"`}
                </div>
              )}

              {/* Critical moment banner */}
              {criticalVisible && (
                <div style={{ position: "absolute", top: 16, right: 16, width: 280, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(180deg, rgba(248,113,113,0.18), rgba(248,113,113,0.06))", border: "1px solid rgba(248,113,113,0.5)", boxShadow: "0 0 30px -5px rgba(248,113,113,0.4)", backdropFilter: "blur(20px)", animation: "rc-floaty 3s ease-in-out infinite" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(248,113,113,0.25)", display: "grid", placeItems: "center", color: "#FCA5A5" }}><Icons.warn size={12} /></div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FCA5A5", letterSpacing: "0.02em" }}>CRITICAL MOMENT DETECTED</div>
                  </div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--ink-0)" }}>The scenario surfaced a possible risk cue. Acknowledge it directly and shift the conversation toward the safest next step.</div>
                </div>
              )}

              {/* User PIP */}
              {isVideoMode && <div style={{ position: "absolute", bottom: 14, right: 14, width: 200, height: 140, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line-2)", background: "linear-gradient(160deg, #1A2540 0%, #0E1A2C 100%)", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.5)" }}>
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
              </div>}
            </div>
          </div>

          {/* Controls */}
          <div style={{ padding: "18px 22px 22px", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(0,0,0,0.6)", border: "1px solid var(--line-2)", borderRadius: 18, backdropFilter: "blur(20px)", boxShadow: "0 14px 40px -10px rgba(0,0,0,0.7)" }}>
              <CtrlBtn icon={<Icons.mic size={18} />} label="Mute" onClick={store.toggleMute} />
              {isVideoMode && <CtrlBtn icon={<Icons.cam size={18} />} label="Camera" onClick={store.toggleCamera} />}
              <CtrlBtn icon={<Icons.hint size={18} />} label="Hint" tone="violet" />
              <CtrlBtn icon={<Icons.bookmark size={18} />} label="Mark" />
              <CtrlBtn icon={<Icons.pause size={18} />} label={isTextMode ? "Hold" : "Pause"} />
              <div style={{ width: 1, height: 32, background: "var(--line)" }} />
              <CtrlBtn icon={<Icons.retry size={18} />} label={isTextMode ? "Reword" : "Reset"} />
              {!isTextMode && <CtrlBtn icon={<Icons.warn size={18} />} label="Emergency" tone="amber" />}
              <button className="rc-btn danger" style={{ padding: "10px 16px", borderRadius: 14, marginLeft: 6 }} onClick={handleEndCall}>
                <Icons.phone size={16} /> {isTextMode ? "End chat" : "End call"}
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
                  "{criticalResponse}"
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="rc-btn sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => setCriticalVisible(false)}>Dismiss</button>
                  <button className="rc-btn sm primary" style={{ flex: 1, justifyContent: "center" }}>{isTextMode ? "Copy reply" : "Use phrasing"}</button>
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
                <span>{isTextMode ? "Written coaching" : isPhoneMode ? "Audio signals" : isVoiceMode ? "Voice signals" : "Nonverbal signals"}</span>
                <span style={{ fontSize: 10, color: "var(--ink-3)", textTransform: "none", letterSpacing: "normal" }}>{isTextMode ? "language quality" : "coaching estimates"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {isTextMode ? (
                  <>
                    <Signal label="Clarity" v={81} tone="ok" />
                    <Signal label="Tone" v={68} tone="warn" raw="slightly tense" />
                    <Signal label="Structure" v={76} tone="violet" />
                    <Signal label="Brevity" v={72} tone="ok" />
                  </>
                ) : (
                  <>
                    {!isPhoneMode && <Signal label="Eye contact" v={62} tone="warn" />}
                    <Signal label="Pace" v={78} tone="warn" raw="168 wpm" />
                    {!isPhoneMode && <Signal label="Engagement" v={84} tone="ok" />}
                    <Signal label="Turn-taking" v={71} tone="violet" />
                    {isPhoneMode && <Signal label="Reassurance" v={73} tone="ok" />}
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 10.5, color: "var(--ink-3)", marginTop: 10 }} className="rc-mono">
                {isTextMode ? <><span>2 rewrites</span><span>·</span><span>3 empathy phrases</span><span>·</span><span>1 escalation cue</span></> : <><span>3 interruptions</span><span>·</span><span>4 clarifiers</span><span>·</span><span>12 fillers</span></>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript dock */}
      {!isTextMode && <div style={{ position: "absolute", bottom: 104, left: 22, width: 380, padding: "12px 14px", borderRadius: 14, background: "rgba(0,0,0,0.6)", border: "1px solid var(--line-2)", backdropFilter: "blur(20px)", boxShadow: "0 12px 30px -10px rgba(0,0,0,0.6)" }}>
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
      </div>}
    </div>
  );
}
