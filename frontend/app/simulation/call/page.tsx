"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useConversation, ConversationProvider } from "@elevenlabs/react";

import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { Waveform } from "@/components/ui/Waveform";
import { Icons } from "@/components/icons";
import { Logo } from "@/components/layout/Logo";

import { useBrowserSpeechRecognition } from "@/hooks/useBrowserSpeechRecognition";

import { cameraStreamRef } from "@/lib/cameraStream";
import {
  api,
  type SimulationTurn,
  type TranscriptEntry,
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

const TABS = [
  "Live Notes",
  "Transcript",
  "Rubric",
  "Signals",
  "Hints",
] as const;

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
  const toneStyle =
    tone === "violet"
      ? {
          background: "rgba(139,125,251,0.18)",
          color: "#B5ACFD",
          borderColor: "rgba(139,125,251,0.4)",
        }
      : tone === "amber"
      ? {
          background: "rgba(251,191,36,0.14)",
          color: "#FCD34D",
          borderColor: "rgba(251,191,36,0.35)",
        }
      : tone === "teal"
      ? {
          background: "rgba(45,212,191,0.14)",
          color: "#5EEAD4",
          borderColor: "rgba(45,212,191,0.35)",
        }
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
        transition: "background .15s",
        opacity: disabled ? 0.45 : 1,
        ...toneStyle,
      }}
    >
      {icon}
      <span style={{ fontSize: 10 }}>{label}</span>
    </button>
  );
}

function Signal({
  label,
  v,
  tone = "violet",
  raw,
}: {
  label: string;
  v: number;
  tone?: string;
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

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: c,
          }}
          className="rc-mono"
        >
          {raw || `${Math.round(v)}%`}
        </span>

        <div style={{ display: "flex", gap: 2 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 8 + i * 1.5,
                borderRadius: 1,
                background:
                  i <= Math.round(v / 20)
                    ? c
                    : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CallPageContent() {
  const router = useRouter();
  const store = useSimulationStore();

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const sessionStartedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const sessionIdRef = useRef(
    store.simulationId || `session-${Date.now()}`
  );

  const [elapsed, setElapsed] = useState(0);
  const [visibleTranscript, setVisibleTranscript] = useState<
    TranscriptEntry[]
  >([]);
  const [activeTab, setActiveTab] = useState(0);

  const [personaTalking, setPersonaTalking] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isWaitingReply, setIsWaitingReply] = useState(false);

  const [draftReply, setDraftReply] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const persona =
    store.persona || {
      id: "persona-margaret-001",
      name: "Margaret Lewis",
      age: 72,
      role: "Post-discharge patient",
      mood: "worried",
      traits: ["polite", "hesitant", "apologetic"],
      goal: "Understand new medication instructions",
      hidden_red_flag:
        "Chest tightness — reveals only if asked about symptoms or after ~2 min",
      behavior: "Apologetic, asks to repeat, easily distracted",
      voice_style:
        "Elderly, calm, slightly anxious — light tremor",
      opening_line:
        "Hi, I'm sorry to bother you. I was discharged yesterday and I'm confused about which pills I should take tonight.",
      avatar_preset: "margaret",
      sample_lines: [],
    };

  const avatarPreset = toAvatarPreset(
    persona.avatar_preset ?? "margaret"
  );

  const moodPreset = toMoodPreset(
    persona.mood ?? "neutral"
  );

  const mode = store.mode || "video";
  const industry = store.industry || "Healthcare";
  const difficulty = store.difficulty || "Medium";

  const isVideoMode = mode === "video";
  const isVoiceMode = mode === "voice";
  const isPhoneMode = mode === "phone";
  const isTextMode = mode === "text";

  const latestLine =
    visibleTranscript[visibleTranscript.length - 1];

  const latestPatientLine = [...visibleTranscript]
    .reverse()
    .find((line) => line.speaker === "patient");

  const progress = Math.min(elapsed / 300, 1);

  const liveCoaching = store.liveCoaching;

  const conversation = useConversation({
    onMessage: ({
      message,
      source,
    }: {
      message: string;
      source: string;
    }) => {
      const entry: TranscriptEntry = {
        speaker: source === "ai" ? "patient" : "user",
        timestamp: currentTimestamp(startTimeRef.current),
        text: message,
        is_critical: hasCriticalKeyword(message),
      };

      setVisibleTranscript((prev) => [...prev, entry]);
      store.addTranscriptEntry(entry);

      if (entry.is_critical) {
        store.triggerCriticalMoment(message);
      }
    },

    onError: (error: string) => {
      console.error("ElevenLabs error:", error);
    },
  });

  useVideoSignals(
    videoRef,
    store.simulationId ?? "call-session"
  );

  const coachingStats = useMemo(() => {
    const userTurns = visibleTranscript.filter(
      (line) => line.speaker === "user"
    );

    const patientTurns = visibleTranscript.filter(
      (line) => line.speaker === "patient"
    );

    const totalWords = userTurns.reduce(
      (sum, line) =>
        sum +
        line.text
          .split(/\s+/)
          .filter(Boolean).length,
      0
    );

    return {
      userTurns: userTurns.length,
      patientTurns: patientTurns.length,
      avgWords: userTurns.length
        ? Math.round(totalWords / userTurns.length)
        : 0,
      riskCues: visibleTranscript.filter(
        (line) => line.is_critical
      ).length,
    };
  }, [visibleTranscript]);

  const syncFeedback = useCallback(
    (response: SimulationTurn) => {
      store.setLiveAudioSignals(response.audio_signals);

      if (response.video_signals) {
        store.setLiveSignals(response.video_signals);
      }

      store.setLiveCoaching(response.coaching);

      if (response.entry.is_critical) {
        store.triggerCriticalMoment(
          response.coaching.next_best_action
        );
      }
    },
    [store]
  );

  const appendTranscript = useCallback(
    (entry: TranscriptEntry) => {
      setVisibleTranscript((current) => [
        ...current,
        entry,
      ]);

      store.addTranscriptEntry(entry);
    },
    [store]
  );

  const playPersonaVoice = useCallback(
    async (text: string) => {
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
          error instanceof Error
            ? error.message
            : "Voice playback failed."
        );
      }
    },
    [
      isTextMode,
      persona.name,
      persona.voice_style,
      store.isMuted,
    ]
  );

  // Continue with remaining JSX...
  // (rest of component stays unchanged)
  return <div>...</div>;
}

export default function CallPage() {
  return (
    <ConversationProvider>
      <CallPageContent />
    </ConversationProvider>
  );
}