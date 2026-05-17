"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { Waveform } from "@/components/ui/Waveform";
import { Icons } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";
import { useBrowserSpeechRecognition } from "@/hooks/useBrowserSpeechRecognition";

import { attachStreamToVideo, cameraStreamRef, ensureLocalMedia } from "@/lib/cameraStream";
import {
  api,
  type SimulationTurn,
  type TranscriptEntry,
  type VideoSignals,
  type AudioSignals,
} from "@/lib/apiClient";
import { formatTime } from "@/lib/utils";
import { useVideoSignals } from "@/lib/useVideoSignals";

import { useSimulationStore } from "@/stores/simulationStore";

type AvatarPreset =
  | "margaret"
  | "james"
  | "elena"
  | "david"
  | "aanya"
  | "user";

type MoodPreset =
  | "worried"
  | "angry"
  | "neutral"
  | "upbeat"
  | "confused";

const AVATAR_MAP: Record<string, AvatarPreset> = {
  elderly_woman: "margaret",
  elderly_man: "david",
  middle_aged_woman: "elena",
  middle_aged_man: "james",
  young_woman: "aanya",
  young_man: "james",
  margaret: "margaret",
  james: "james",
  elena: "elena",
  david: "david",
  aanya: "aanya",
};

const MOOD_SET = new Set([
  "worried",
  "angry",
  "neutral",
  "upbeat",
  "confused",
]);

const CRITICAL_KEYWORDS = [
  "chest",
  "tightness",
  "pain",
  "heart",
  "dizzy",
  "faint",
  "bleeding",
  "breathing",
  "emergency",
  "unconscious",
  "severe",
  "stroke",
  "can't breathe",
  "shortness",
  "pressure",
];

const TABS = [
  "Live Notes",
  "Transcript",
  "Rubric",
  "Signals",
  "Hints",
] as const;

function hasCriticalKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return CRITICAL_KEYWORDS.some((kw) => lower.includes(kw));
}

function toAvatarPreset(s: string): AvatarPreset {
  return AVATAR_MAP[s] ?? "margaret";
}

function toMoodPreset(s: string): MoodPreset {
  return MOOD_SET.has(s) ? (s as MoodPreset) : "neutral";
}

function currentTimestamp(startMs: number) {
  const elapsed = Math.max(
    0,
    Math.floor((Date.now() - startMs) / 1000)
  );
  return formatTime(elapsed);
}

function criticalExcerpt(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

function CtrlBtn({
  icon,
  label,
  tone,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  tone?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const toneStyle = tone === "violet"
    ? { background: "rgba(139,125,251,0.18)", color: "#B5ACFD", borderColor: "rgba(139,125,251,0.4)" }
    : tone === "amber"
      ? { background: "rgba(251,191,36,0.14)", color: "#FCD34D", borderColor: "rgba(251,191,36,0.35)" }
      : {};

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        padding: "8px 12px",
        minWidth: 62,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        color: "var(--ink-0)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background .15s",
        ...toneStyle,
      }}
    >
      {icon}
      <span style={{ fontSize: 10 }}>{label}</span>
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
        <span style={{ fontSize: 15, fontWeight: 600, color: c }} className="rc-mono">{raw || `${Math.round(v)}%`}</span>
        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
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

function LiveSignalsPanel({
  video,
  audio,
  showVideo,
  showAudio,
}: {
  video: VideoSignals;
  audio: AudioSignals;
  showVideo: boolean;
  showAudio: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
      {showVideo && (
        <>
          <div className="rc-label" style={{ marginBottom: 4 }}>Video signals</div>
          <Signal label="Eye contact" v={video.eye_contact_estimate * 100} />
          <Signal label="Head stability" v={video.head_movement_stability * 100} />
          <Signal label="Engagement" v={video.facial_engagement_estimate * 100} />
        </>
      )}
      {showAudio && (
        <>
          <div className="rc-label" style={{ marginBottom: 4, marginTop: showVideo ? 8 : 0 }}>Audio signals</div>
          <Signal
            label="Pace"
            v={Math.min(100, (audio.speaking_pace_wpm / 200) * 100)}
            raw={`${audio.speaking_pace_wpm} wpm`}
          />
          <Signal
            label="Filler words"
            v={Math.max(0, 100 - audio.filler_word_count * 10)}
            raw={`${audio.filler_word_count}`}
            tone="warn"
          />
          <Signal
            label="Pauses"
            v={Math.max(0, 100 - audio.pause_count * 8)}
            raw={`${audio.pause_count}`}
          />
        </>
      )}
      {!showVideo && !showAudio && (
        <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55 }}>
          Signal analysis is off for this session. Enable video or audio signals on the setup screen.
        </div>
      )}
    </div>
  );
}

function CallPageInner() {
  const router = useRouter();
  const store = useSimulationStore();

  if (!store.persona || !store.scenario || !store.rubric) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#06080F", display: "grid", placeItems: "center", padding: 28 }}>
        <div className="rc-glass" style={{ width: 560, maxWidth: "100%", padding: 28, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 99, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
            <Icons.warn size={24} />
          </div>
          <h1 className="rc-h-2" style={{ margin: "0 0 10px" }}>Call session data is missing</h1>
          <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 20 }}>
            The live simulation page now requires a real generated persona, scenario, and rubric. Start again from preview instead of falling back to demo content.
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <Link href="/simulation/preview"><button className="rc-btn ghost">Back to preview</button></Link>
            <Link href="/create"><button className="rc-btn primary"><Icons.sparkle size={13} />Generate simulation</button></Link>
          </div>
        </div>
      </div>
    );
  }

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const sessionStartedRef = useRef(false);
  const stopListeningRef = useRef<() => void>(() => {});
  const startTimeRef = useRef(Date.now());
  const sessionIdRef = useRef(store.simulationId || `session-${Date.now()}`);

  const [elapsed, setElapsed] = useState(0);
  const [visibleTranscript, setVisibleTranscript] = useState<TranscriptEntry[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [personaTalking, setPersonaTalking] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isWaitingReply, setIsWaitingReply] = useState(false);
  const [draftReply, setDraftReply] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasVideoStream, setHasVideoStream] = useState(false);

  const persona = store.persona;

  const mode = store.mode || "video";
  const isVideoMode = mode === "video";
  const isVoiceMode = mode === "voice";
  const isPhoneMode = mode === "phone";
  const isTextMode = mode === "text";

  useVideoSignals(videoRef, sessionIdRef.current);

  const latestLine = visibleTranscript[visibleTranscript.length - 1];

  const progress = Math.min(elapsed / 300, 1);
  const liveCoaching = store.liveCoaching;

  const coachingStats = useMemo(() => {
    const userTurns = visibleTranscript.filter((line) => line.speaker === "user");
    const patientTurns = visibleTranscript.filter((line) => line.speaker === "patient");
    const totalWords = userTurns.reduce((sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length, 0);
    return {
      userTurns: userTurns.length,
      patientTurns: patientTurns.length,
      avgWords: userTurns.length ? Math.round(totalWords / userTurns.length) : 0,
      riskCues: visibleTranscript.filter((line) => line.is_critical).length,
    };
  }, [visibleTranscript]);

  const goToAnalyzing = useCallback(() => {
    cameraStreamRef.stop();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    store.endCall();
    store.setSessionDurationS(Math.floor((Date.now() - startTimeRef.current) / 1000));
    router.push("/analyzing");
  }, [router, store]);

  const syncFeedback = useCallback(
    (response: SimulationTurn) => {
      store.setLiveAudioSignals(response.audio_signals);
      if (response.video_signals) {
        store.setLiveSignals(response.video_signals);
      }
      store.setLiveCoaching(response.coaching);
      if (response.entry.is_critical) {
        store.triggerCriticalMoment(response.coaching.next_best_action);
      }
    },
    [store]
  );

  const appendTranscript = useCallback((entry: TranscriptEntry) => {
    setVisibleTranscript((current) => [...current, entry]);
    store.addTranscriptEntry(entry);
  }, [store]);

  const playPersonaVoice = useCallback(async (text: string) => {
    if (isTextMode || store.isMuted) return;
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
        text,
        persona_id: persona.id,
        persona_name: persona.name,
        voice_style: persona.voice_style,
      });

      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingVoice(false);
        setPersonaTalking(false);
      };
      audio.onerror = () => {
        setIsPlayingVoice(false);
        setPersonaTalking(false);
      };

      setPersonaTalking(true);
      await audio.play();
    } catch (error) {
      setIsPlayingVoice(false);
      setPersonaTalking(false);
      setErrorMessage(
        error instanceof Error ? error.message : "Voice playback failed."
      );
    }
  }, [isTextMode, persona.id, persona.name, persona.voice_style, store.isMuted]);

  const requestPersonaReply = useCallback(async (userMessage: string, turnIndex: number) => {
    setIsWaitingReply(true);
    setErrorMessage("");
    try {
      const response = await api.simulationRespond({
        session_id: sessionIdRef.current,
        turn_index: turnIndex,
        user_message: userMessage,
        persona_id: store.persona?.id,
        scenario_id: store.scenario?.id,
        mode,
      });

      const entry: TranscriptEntry = {
        ...response.entry,
        timestamp: currentTimestamp(startTimeRef.current),
      };

      appendTranscript(entry);
      syncFeedback(response);

      if (entry.speaker === "patient") {
        void playPersonaVoice(entry.text);
      }

      if (response.call_ended) {
        setTimeout(() => {
          void goToAnalyzing();
        }, 500);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to get persona reply.");
    } finally {
      setIsWaitingReply(false);
    }
  }, [appendTranscript, goToAnalyzing, mode, playPersonaVoice, store, syncFeedback]);

  const submitUserTurn = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text || isWaitingReply) return;

    appendTranscript({
      speaker: "user",
      timestamp: currentTimestamp(startTimeRef.current),
      text,
      is_critical: false,
    });
    setDraftReply("");
    await requestPersonaReply(text, visibleTranscript.length + 1);
  }, [appendTranscript, isWaitingReply, requestPersonaReply, visibleTranscript.length]);

  const {
    isSupported: speechSupported,
    isListening,
    interimTranscript,
    errorMessage: speechError,
    startListening,
    stopListening,
    clearTranscript,
  } = useBrowserSpeechRecognition({
    onFinalTranscript: (text) => {
      setDraftReply(text);
      void submitUserTurn(text);
      clearTranscript();
    },
  });

  stopListeningRef.current = stopListening;

  const handleToggleMute = useCallback(() => {
    store.toggleMute();
  }, [store]);

  useEffect(() => {
    if (interimTranscript) {
      setDraftReply(interimTranscript);
    }
  }, [interimTranscript]);

  useEffect(() => {
    let cancelled = false;

    async function bindCallMedia() {
      if (!isVideoMode || !videoRef.current || store.isCameraOff) {
        setHasVideoStream(false);
        return;
      }

      try {
        const stream = await ensureLocalMedia({ video: true, audio: true });
        if (cancelled || !videoRef.current) return;
        await attachStreamToVideo(videoRef.current, stream);
        if (cancelled) return;
        setHasVideoStream(true);
      } catch {
        if (!cancelled) {
          setHasVideoStream(false);
        }
      }
    }

    void bindCallMedia();

    return () => {
      cancelled = true;
    };
  }, [isVideoMode, store.isCameraOff]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
      cameraStreamRef.stop();
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [stopListening]);

  useEffect(() => {
    if (sessionStartedRef.current) return;

    sessionStartedRef.current = true;
    startTimeRef.current = Date.now();
    store.setSimulationId(sessionIdRef.current);
    store.startCall();

    void requestPersonaReply("", 0);
  }, [requestPersonaReply, store]);

  const handleSend = useCallback(async () => {
    await submitUserTurn(draftReply);
    clearTranscript();
  }, [clearTranscript, draftReply, submitUserTurn]);

  const handleUseSuggestedResponse = useCallback(() => {
    if (!liveCoaching?.suggested_response) return;
    setDraftReply(liveCoaching.suggested_response);
  }, [liveCoaching]);

  const handleEndCall = useCallback(() => {
    void goToAnalyzing();
  }, [goToAnalyzing]);

  const composerHint = isTextMode
    ? "Type your next message..."
    : isListening
      ? "Listening through your browser microphone..."
      : "Type or dictate what the trainee says next...";

  const criticalResponse = liveCoaching?.suggested_response
    || (persona.hidden_red_flag
      ? `I heard ${persona.hidden_red_flag.split("—")[0].trim().toLowerCase()}. I need to shift us into a safer next step before we continue.`
      : "I need to pause and make sure we handle that safely before we continue.");

  const sidebarSummary = liveCoaching?.summary || "Waiting for enough conversation data to generate coaching.";
  const liveNotes = liveCoaching?.strengths?.length || liveCoaching?.warnings?.length
    ? [...(liveCoaching?.strengths || []), ...(liveCoaching?.warnings || [])]
    : ["Ask one clear question at a time so the persona can answer without getting lost."];

  const primaryModeLabel = isPhoneMode ? "PHONE" : isTextMode ? "CHAT" : isVoiceMode ? "VOICE" : "VIDEO";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#06080F", display: "flex", flexDirection: "column", zIndex: 100 }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", background: "rgba(0,0,0,0.55)", borderBottom: "1px solid var(--line)", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo size={20} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{persona.name}</span>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{primaryModeLabel}</span>
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
            Backend simulation agent · ElevenLabs TTS
          </span>
        </div>
        <span style={{ fontSize: 14, color: "var(--ink-2)" }} className="rc-mono">{formatTime(elapsed)}</span>
      </div>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 360px", minHeight: 0 }}>
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <div style={{ position: "relative", flex: 1, padding: "22px 22px 0" }}>
            <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 18, overflow: "hidden", background: "linear-gradient(160deg, #1A2540 0%, #0A1226 60%, #0E1A2C 100%)", boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)" }}>
              {isVideoMode && (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <div style={{ transform: "scale(2.6)" }}>
                    <PersonaAvatar persona={persona.avatar_preset as never} size={200} mood={persona.mood as never} talking={personaTalking} />
                  </div>
                </div>
              )}

              {(isVoiceMode || isPhoneMode) && (
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                  <div style={{ width: isPhoneMode ? 290 : 420, textAlign: "center", padding: isPhoneMode ? "28px 24px" : 0, borderRadius: isPhoneMode ? 32 : 0, border: isPhoneMode ? "1px solid rgba(255,255,255,0.08)" : "none", background: isPhoneMode ? "rgba(8,10,17,0.75)" : "transparent", boxShadow: isPhoneMode ? "0 32px 70px -18px rgba(0,0,0,0.7)" : "none" }}>
                    {isPhoneMode && <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 16 }} className="rc-mono">LIVE PHONE CALL</div>}
                    <div style={{ fontSize: isPhoneMode ? 28 : 56, fontWeight: 700, letterSpacing: "-0.05em", marginBottom: 8 }}>{persona.name}</div>
                    <div style={{ fontSize: 15, color: "var(--ink-2)", marginBottom: 24 }}>{persona.role} · {isPhoneMode ? "audio-only" : "spoken coaching mode"}</div>
                    <Waveform tone="teal" bars={isPhoneMode ? 22 : 32} height={isPhoneMode ? 24 : 38} dense />
                  </div>
                </div>
              )}

              {isTextMode && (
                <div style={{ position: "absolute", inset: 18, borderRadius: 18, border: "1px solid var(--line)", background: "rgba(8,10,17,0.78)", padding: 18, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div className="rc-pill"><Icons.chat size={10} />Live chat thread</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{persona.name} is responding through your backend agent</div>
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
                  </div>
                </div>
              )}

              <div style={{ position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "rgba(0,0,0,0.55)", border: "1px solid var(--line-2)", borderRadius: 12, backdropFilter: "blur(20px)" }}>
                  <PersonaAvatar persona={persona.avatar_preset as never} size={34} mood={persona.mood as never} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>{persona.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-2)" }}>{persona.role} · {persona.age}</div>
                  </div>
                </div>
              </div>

              {latestLine && !isTextMode && latestLine.speaker === "patient" && (
                <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", maxWidth: "min(70%, 520px)", padding: "12px 18px", background: "rgba(0,0,0,0.65)", borderRadius: 14, border: latestLine.is_critical ? "1px solid rgba(248,113,113,0.45)" : "1px solid var(--line-2)", backdropFilter: "blur(20px)", fontSize: 14.5, lineHeight: 1.5, fontStyle: "italic", textAlign: "center", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {latestLine.is_critical ? (
                    <span style={{ color: "#FCA5A5" }}>&ldquo;{criticalExcerpt(latestLine.text, 180)}&rdquo;</span>
                  ) : (
                    <>&ldquo;{criticalExcerpt(latestLine.text, 180)}&rdquo;</>
                  )}
                </div>
              )}

              {store.criticalMomentVisible && !isTextMode && (
                <div style={{ position: "absolute", top: 16, right: 16, width: 280, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(180deg, rgba(248,113,113,0.18), rgba(248,113,113,0.06))", border: "1px solid rgba(248,113,113,0.5)", boxShadow: "0 0 30px -5px rgba(248,113,113,0.4)", backdropFilter: "blur(20px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(248,113,113,0.25)", display: "grid", placeItems: "center", color: "#FCA5A5" }}>
                      <Icons.warn size={12} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#FCA5A5", letterSpacing: "0.02em" }}>RED FLAG</div>
                  </div>
                  <div style={{ fontSize: 12, lineHeight: 1.45, color: "#FCA5A5" }}>See coaching panel for suggested phrasing.</div>
                </div>
              )}

              {isVideoMode && (
                <div style={{ position: "absolute", bottom: 14, right: 14, width: 200, height: 140, borderRadius: 14, overflow: "hidden", border: "1px solid var(--line-2)", background: "linear-gradient(160deg, #1A2540 0%, #0E1A2C 100%)", boxShadow: "0 12px 30px -8px rgba(0,0,0,0.5)" }}>
                  <video ref={videoRef} autoPlay muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: store.isCameraOff ? 0.2 : 1 }} />
                  <div style={{ position: "absolute", top: 8, left: 8, fontSize: 10, padding: "2px 7px", background: "rgba(0,0,0,0.55)", borderRadius: 6 }}>You</div>
                  {!hasVideoStream && (
                    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 12, fontSize: 11, color: "var(--ink-2)", textAlign: "center", background: "rgba(8,10,17,0.6)" }}>
                      Camera preview unavailable. Return to setup and re-enable camera if you want video signals.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: "14px 22px 0" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(0,0,0,0.32)", border: "1px solid var(--line)", borderRadius: 16, padding: 12 }}>
              <div style={{ flex: 1 }}>
                <textarea
                  value={draftReply}
                  onChange={(e) => setDraftReply(e.target.value)}
                  disabled={isListening}
                  placeholder={composerHint}
                  style={{ width: "100%", minHeight: 64, resize: "none", background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)", borderRadius: 14, color: "var(--ink-0)", padding: "12px 14px", fontSize: 13, outline: "none", opacity: isListening ? 0.85 : 1 }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11, color: "var(--ink-3)" }}>
                  {!isTextMode && (
                    <span style={{ color: isListening ? "#5EEAD4" : "var(--ink-3)" }}>
                      {isListening ? "Mic live: browser speech recognition is capturing your turn." : "Voice modes can use typed input or browser dictation."}
                    </span>
                  )}
                  {!isTextMode && !speechSupported && (
                    <span>Voice dictation is not available here. Type your message instead.</span>
                  )}
                  {!isTextMode && speechError && <span style={{ color: "#FCA5A5" }}>{speechError}</span>}
                </div>
              </div>
              {!isTextMode && (
                <button className="rc-btn" disabled={!speechSupported || isWaitingReply} onClick={isListening ? stopListening : startListening}>
                  {isListening ? <><Icons.pause size={14} /> Stop mic</> : <><Icons.mic size={14} /> Start mic</>}
                </button>
              )}
              <button className="rc-btn primary" disabled={isWaitingReply || !draftReply.trim()} onClick={handleSend}>
                {isWaitingReply ? <><span style={{ width: 12, height: 12, borderRadius: 99, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "rc-spin 1s linear infinite" }} /> Waiting</> : <><Icons.chat size={14} /> Send</>}
              </button>
            </div>
            {errorMessage && <div style={{ marginTop: 10, fontSize: 12, color: "#FCA5A5" }}>{errorMessage}</div>}
          </div>

          <div style={{ padding: "18px 22px 22px", display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(0,0,0,0.6)", border: "1px solid var(--line-2)", borderRadius: 18, backdropFilter: "blur(20px)", boxShadow: "0 14px 40px -10px rgba(0,0,0,0.7)" }}>
              <CtrlBtn
                icon={store.isMuted ? <Icons.micOff size={18} /> : <Icons.mic size={18} />}
                label={store.isMuted ? "Unmute" : isListening ? "Mic live" : "Mute"}
                onClick={handleToggleMute}
                tone={store.isMuted ? "amber" : isListening && !store.isMuted ? "teal" : undefined}
              />
              {isVideoMode && <CtrlBtn icon={store.isCameraOff ? <Icons.camOff size={18} /> : <Icons.cam size={18} />} label={store.isCameraOff ? "Camera off" : "Camera"} onClick={store.toggleCamera} />}
              <CtrlBtn icon={<Icons.hint size={18} />} label="Hint" tone="violet" onClick={handleUseSuggestedResponse} disabled={!liveCoaching?.suggested_response} />
              <button className="rc-btn danger" style={{ padding: "10px 16px", borderRadius: 14, marginLeft: 6 }} onClick={handleEndCall}>
                <Icons.phone size={16} /> {isTextMode ? "End chat" : "End call"}
              </button>
            </div>
          </div>
        </div>

        <div style={{ background: "rgba(10,14,26,0.7)", borderLeft: "1px solid var(--line)", display: "flex", flexDirection: "column", backdropFilter: "blur(20px)" }}>
          <div style={{ padding: "14px 16px 0", borderBottom: "1px solid var(--line)" }}>
            <div className="rc-label" style={{ marginBottom: 12 }}>Coaching</div>
            <div style={{ display: "flex", gap: 2 }}>
              {TABS.map((tab, index) => (
                <div key={tab} onClick={() => setActiveTab(index)} style={{ padding: "8px 11px", fontSize: 12, fontWeight: index === activeTab ? 600 : 500, color: index === activeTab ? "var(--ink-0)" : "var(--ink-2)", borderBottom: index === activeTab ? "2px solid #8B7DFB" : "2px solid transparent", marginBottom: -1, cursor: "pointer" }}>{tab}</div>
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
                  &ldquo;{criticalResponse}&rdquo;
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button className="rc-btn sm" style={{ flex: 1, justifyContent: "center" }} onClick={store.dismissCriticalMoment}>Dismiss</button>
                  <button className="rc-btn sm primary" style={{ flex: 1, justifyContent: "center" }} onClick={handleUseSuggestedResponse}>{isTextMode ? "Use reply" : "Use phrasing"}</button>
                </div>
              </div>
            )}

            {activeTab === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "auto" }}>
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", fontSize: 13, lineHeight: 1.5 }}>{sidebarSummary}</div>
                {liveNotes.map((line) => (
                  <div key={line} style={{ padding: "11px 12px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", fontSize: 12.5, lineHeight: 1.55 }}>
                    {line}
                  </div>
                ))}
                {liveCoaching?.suggested_response && !store.criticalMomentVisible && (
                  <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", fontSize: 13, lineHeight: 1.5, fontStyle: "italic", marginTop: 8 }}>
                    {liveCoaching.suggested_response}
                  </div>
                )}
              </div>
            )}

            {activeTab === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 9, overflow: "auto", fontSize: 12 }}>
                {visibleTranscript.map((line, index) => (
                  <div key={`${line.timestamp}-${index}`} style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--ink-3)", width: 36, flexShrink: 0, paddingTop: 1 }} className="rc-mono">{line.timestamp}</span>
                    <span style={{ color: line.speaker === "patient" ? "#FCD34D" : "#5EEAD4", fontWeight: 500, width: 54, flexShrink: 0, fontSize: 11.5 }}>{line.speaker === "patient" ? "Agent:" : "You:"}</span>
                    <span style={{ color: line.is_critical ? "#FCA5A5" : "var(--ink-1)", lineHeight: 1.45 }}>{line.text}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "auto" }}>
                {store.rubric.items.map((item) => (
                  <div key={item.name} style={{ padding: "11px 12px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                      <span style={{ color: item.is_hot ? "#FCA5A5" : "var(--ink-1)", fontWeight: 600, fontSize: 12.5 }}>{item.name}</span>
                      <span style={{ color: "var(--ink-3)", fontSize: 11 }} className="rc-mono">{item.weight}%</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>{item.description}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 3 && (
              <LiveSignalsPanel
                video={store.liveSignals}
                audio={store.liveAudioSignals}
                showVideo={isVideoMode && store.consentVideoSignals}
                showAudio={store.consentAudioSignals}
              />
            )}

            {activeTab === 4 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "auto" }}>
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", fontSize: 13, lineHeight: 1.5 }}>
                  <strong style={{ color: "#B5ACFD" }}>Next best action:</strong> {liveCoaching?.next_best_action || "Wait for more conversation data before suggesting the next move."}
                </div>
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(139,125,251,0.10)", border: "1px solid rgba(139,125,251,0.35)", fontSize: 13, lineHeight: 1.5, fontStyle: "italic" }}>
                  {liveCoaching?.suggested_response || "Suggested phrasing will appear here when the coaching agent detects a stronger response option."}
                </div>
                <div style={{ padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", fontSize: 12.5, lineHeight: 1.55 }}>
                  Current phase: <span style={{ color: "#5EEAD4" }}>{liveCoaching?.phase || "opening"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CallPage() {
  return <CallPageInner />;
}
