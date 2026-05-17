"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { api } from "@/lib/apiClient";
import { useSimulationStore } from "@/stores/simulationStore";

const MODE_OPTIONS = [
  { id: "video", label: "Video" },
  { id: "voice", label: "Voice" },
  { id: "phone", label: "Phone" },
  { id: "text", label: "Chat" },
] as const;

export default function PreviewPage() {
  const router = useRouter();
  const { persona, scenario, rubric, mode, setMode } = useSimulationStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const p = persona || {
    name: "Margaret Lewis",
    age: 72,
    role: "Post-discharge patient",
    mood: "worried",
    goal: "Understand new medication instructions",
    hidden_red_flag: "Chest tightness if asked about symptoms",
    opening_line:
      "Hi, I'm sorry to bother you. I was discharged yesterday and I'm confused about which pills I should take tonight.",
    avatar_preset: "margaret",
    voice_style: "Elderly, calm, slightly anxious",
  };
  const s = scenario || {
    title: "Post-surgery follow-up call",
    description:
      "Patient is confused about medication. A red flag may surface if you ask the right questions.",
    your_role: "Care coordinator",
    duration: "~5 min",
    objective: "Identify urgent concerns and escalate if needed",
    difficulty: "Medium",
  };
  const r = rubric || {
    items: [
      { name: "Empathy", weight: 18, is_hot: false },
      { name: "Red-flag detection", weight: 20, is_hot: true },
      { name: "Escalation", weight: 18, is_hot: true },
    ],
  };
  const resolvedMode = mode || "video";

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const handlePlayVoice = async () => {
    try {
      setVoiceError("");
      setIsPlayingVoice(true);
      audioRef.current?.pause();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      const blob = await api.synthesizeVoice({
        text: p.opening_line,
        persona_name: p.name,
        voice_style: p.voice_style,
      });
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => setIsPlayingVoice(false);
      audio.onerror = () => {
        setVoiceError("Playback failed.");
        setIsPlayingVoice(false);
      };
      await audio.play();
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : "Playback failed.");
      setIsPlayingVoice(false);
    }
  };

  return (
    <AppShell>
      <TopNav active="New" compact />
      <main style={{ flex: 1, padding: "28px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <h1 className="rc-h-2" style={{ margin: 0 }}>Review & start</h1>
          <button type="button" className="rc-btn primary" onClick={() => router.push("/simulation/setup")}>
            Continue
          </button>
        </div>

        <article className="rc-glass" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <PersonaAvatar persona={p.avatar_preset as never} size={72} mood={p.mood as never} />
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>{p.name}</h2>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)" }}>
                {p.age} · {p.role}
              </p>
              <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--ink-1)" }}>
                {p.goal}
              </p>
              {p.hidden_red_flag && (
                <p style={{ margin: "8px 0 0", fontSize: 13, color: "#FCA5A5" }}>{p.hidden_red_flag}</p>
              )}
            </div>
          </div>
          <blockquote style={{ margin: "16px 0 0", padding: "12px 14px", borderLeft: "2px solid var(--line-2)", fontSize: 14, fontStyle: "italic", color: "var(--ink-1)" }}>
            &ldquo;{p.opening_line}&rdquo;
          </blockquote>
          <button type="button" className="rc-btn sm" style={{ marginTop: 12 }} onClick={handlePlayVoice} disabled={isPlayingVoice}>
            {isPlayingVoice ? "Playing…" : "Play opening line"}
          </button>
          {voiceError && <p style={{ marginTop: 8, fontSize: 12, color: "#FCA5A5" }}>{voiceError}</p>}
        </article>

        <article className="rc-glass" style={{ padding: 20, marginBottom: 16 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 600 }}>{s.title}</h2>
          <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{s.description}</p>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--ink-3)" }}>
            Your role: {s.your_role} · {s.duration}
          </p>
        </article>

        <article className="rc-glass" style={{ padding: 20, marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600 }}>Rubric</h2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {r.items.map((item) => (
              <li key={item.name} style={{ fontSize: 14, color: item.is_hot ? "#FCA5A5" : "var(--ink-1)" }}>
                {item.name}
              </li>
            ))}
          </ul>
        </article>

        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: "0 0 10px" }}>Mode</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className="rc-btn"
                onClick={() => setMode(option.id)}
                style={{
                  background:
                    option.id === resolvedMode ? "rgba(139,125,251,0.2)" : "rgba(255,255,255,0.04)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          {resolvedMode === "video" && (
            <p style={{ marginTop: 12, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
              Video signals are coaching estimates only—not emotion or medical assessment.
            </p>
          )}
        </section>
      </main>
    </AppShell>
  );
}
