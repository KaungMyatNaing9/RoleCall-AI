"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { api } from "@/lib/apiClient";
import { MODE_SPECIFIC_EVALUATION_CRITERIA } from "@/lib/constants";
import { useSimulationStore } from "@/stores/simulationStore";

const MODE_OPTIONS = [
  { id: "video", label: "Video" },
  { id: "voice", label: "Voice" },
  { id: "phone", label: "Phone" },
  { id: "text", label: "Chat" },
] as const;

type ModeId = (typeof MODE_OPTIONS)[number]["id"];

export default function PreviewPage() {
  const router = useRouter();
  const { persona, scenario, rubric, mode, agentLog, evaluationFocus, setMode, setRubric } = useSimulationStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [isRefreshingRubric, setIsRefreshingRubric] = useState(false);
  const [rubricError, setRubricError] = useState("");

  if (!persona || !scenario || !rubric) {
    return (
      <AppShell>
        <TopNav active="Simulations" compact />
        <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 28 }}>
          <div className="rc-glass" style={{ width: 560, maxWidth: "100%", padding: 28, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
              <Icons.warn size={24} />
            </div>
            <h1 className="rc-h-2" style={{ margin: "0 0 10px" }}>Simulation data is missing</h1>
            <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55, marginBottom: 20 }}>
              This preview now requires a real generated persona, scenario, and rubric. Generate a new simulation instead of falling back to demo content.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <Link href="/dashboard"><button className="rc-btn ghost">Back to dashboard</button></Link>
              <Link href="/create"><button className="rc-btn primary"><Icons.sparkle size={13} />Generate simulation</button></Link>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  const p = persona;
  const s = scenario;
  const r = rubric;
  const resolvedMode: ModeId = (mode as ModeId) || "video";
  const selectedModeOption = MODE_OPTIONS.find((option) => option.id === resolvedMode) || MODE_OPTIONS[2];
  const resolvedAgentLog = agentLog.length ? agentLog : [
    { agent: "Persona Generator", color: "#2DD4BF", message: `Generated ${persona.name} for ${scenario.industry}.` },
    { agent: "Scenario Builder", color: "#8B7DFB", message: `${scenario.title} · ${scenario.difficulty}.` },
    { agent: "Rubric Agent", color: "#FCD34D", message: `Prepared ${rubric.items.length} real evaluation criteria.` },
  ];
  const openingLineDuration = Math.max(3, Math.round(p.opening_line.split(" ").length / 2.8));
  const modeSpecificAdds: string[] = [...(MODE_SPECIFIC_EVALUATION_CRITERIA[resolvedMode] ?? [])];
  const modeSpecificRemovals: string[] = Array.from(
    new Set(
      Object.entries(MODE_SPECIFIC_EVALUATION_CRITERIA)
        .filter(([key]) => key !== resolvedMode)
        .flatMap(([, items]) => items)
    )
  ).filter((item) => !modeSpecificAdds.includes(item));
  const modeMeta = resolvedMode === "voice"
    ? {
        label: "Web voice",
        icon: <Icons.mic size={10} />,
        capabilities: [
          ["Camera", "Optional", <Icons.cam size={12} key="cam" />],
          ["Microphone", "Required", <Icons.mic size={12} key="mic" />],
          ["Transcript", "Live", <Icons.chat size={12} key="chat" />],
          ["Signals", "Audio focus", <Icons.signal size={12} key="sig" />],
        ],
        notice: "Voice mode emphasizes pace, interruption handling, filler words, and turn-taking without requiring full camera presence.",
        cta: "Start voice session",
        ctaIcon: <Icons.mic size={14} />,
      }
    : resolvedMode === "phone"
      ? {
          label: "Phone call",
          icon: <Icons.phone size={10} />,
          capabilities: [
            ["Camera", "Off", <Icons.cam size={12} key="cam" />],
            ["Microphone", "Required", <Icons.mic size={12} key="mic" />],
            ["Transcript", "Live", <Icons.chat size={12} key="chat" />],
            ["Signals", "Audio only", <Icons.signal size={12} key="sig" />],
          ],
          notice: "Phone mode removes visual cues and pressures the trainee to clarify, reassure, and lead the call using only voice.",
          cta: "Start phone call",
          ctaIcon: <Icons.phone size={14} />,
        }
      : resolvedMode === "text"
        ? {
            label: "Text / chat",
            icon: <Icons.chat size={10} />,
            capabilities: [
              ["Camera", "Not used", <Icons.cam size={12} key="cam" />],
              ["Microphone", "Not used", <Icons.mic size={12} key="mic" />],
              ["Transcript", "Primary UI", <Icons.chat size={12} key="chat" />],
              ["Signals", "Text only", <Icons.signal size={12} key="sig" />],
            ],
            notice: "Text mode is built for reading speed, written clarity, and de-escalation through careful wording rather than vocal delivery.",
            cta: "Start chat simulation",
            ctaIcon: <Icons.chat size={14} />,
          }
        : {
            label: "Web video",
            icon: <Icons.video size={10} />,
            capabilities: [
              ["Camera", "Required", <Icons.cam size={12} key="cam" />],
              ["Microphone", "Required", <Icons.mic size={12} key="mic" />],
              ["Transcript", "Live", <Icons.chat size={12} key="chat" />],
              ["Signals", "Audio + Video", <Icons.signal size={12} key="sig" />],
            ],
            notice: "Video signals are coaching estimates — not emotion or truth detection. You can disable them any time.",
            cta: "Start practice",
            ctaIcon: <Icons.video size={14} />,
          };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  const handleModeSelect = async (nextMode: ModeId) => {
    setMode(nextMode);
    if (!scenario?.id) {
      return;
    }
    try {
      setRubricError("");
      setIsRefreshingRubric(true);
      const nextRubric = await api.generateRubric({
        scenario_id: scenario.id,
        industry: scenario.industry || "Healthcare",
        difficulty: scenario.difficulty || "Medium",
        mode: nextMode,
        evaluation_focus: evaluationFocus,
      });
      setRubric(nextRubric);
    } catch (error) {
      setRubricError(error instanceof Error ? error.message : "Rubric refresh failed.");
    } finally {
      setIsRefreshingRubric(false);
    }
  };

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
        persona_id: p.id,
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

        <section>
          {/* Scenario + Rubric */}
          <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 16 }}>
            <div className="rc-glass" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div className="rc-label">Scenario</div>
                <div className="rc-pill warn">{s.difficulty}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 10 }}>{s.description}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11.5, marginTop: "auto" }}>
                {[["YOUR ROLE", s.your_role], ["DURATION", s.duration], ["OBJECTIVE", s.objective], ["SUCCESS WHEN", s.success_condition]].map(([k, v]) => (
                  <div key={k}><div style={{ color: "var(--ink-3)", fontSize: 10, letterSpacing: "0.05em", marginBottom: 2 }}>{k}</div><div>{v}</div></div>
                ))}
              </div>
            </div>
            <div className="rc-glass" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div className="rc-label">Evaluation rubric</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isRefreshingRubric && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Refreshing for {modeMeta.label.toLowerCase()}…</div>}
                  <button style={{ fontSize: 11, color: "var(--ink-2)", background: "none", border: "none", cursor: "pointer" }}>Edit ↗</button>
                </div>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(79,124,255,0.06)", border: "1px solid rgba(79,124,255,0.22)", marginBottom: 12 }}>
                <div style={{ fontSize: 10.5, color: "var(--ink-3)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
                  Mode-specific rubric adjustment
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-1)", lineHeight: 1.55 }}>
                  {modeSpecificAdds.length > 0 ? (
                    <div>
                      <strong style={{ color: "#93B4FF" }}>{modeMeta.label} adds:</strong> {modeSpecificAdds.join(", ")}
                    </div>
                  ) : (
                    <div>
                      <strong style={{ color: "#93B4FF" }}>{modeMeta.label} adds:</strong> no extra mode-specific criteria
                    </div>
                  )}
                  <div style={{ marginTop: 4 }}>
                    <strong style={{ color: "#FCD34D" }}>{modeMeta.label} removes or skips:</strong> {modeSpecificRemovals.join(", ")}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {r.items.map((item: any) => (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                    <span style={{ flex: 1, color: item.is_hot ? "#FCA5A5" : "var(--ink-1)", fontWeight: item.is_hot ? 500 : 400 }}>{item.name}</span>
                    <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${item.weight * 4}%`, background: item.is_hot ? "linear-gradient(90deg,#F87171,#FBBF24)" : "linear-gradient(90deg,#2DD4BF,#8B7DFB)" }} />
                    </div>
                    <span style={{ width: 30, textAlign: "right", color: "var(--ink-3)", fontSize: 11 }} className="rc-mono">{item.weight}%</span>
                  </div>
                ))}
              </div>
              {rubricError && <div style={{ marginTop: 10, fontSize: 11, color: "#FCA5A5" }}>{rubricError}</div>}
            </div>
          </div>

          {/* Mode card + agent log */}
          <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 16 }}>
            <div className="rc-glass" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div className="rc-label">Choose training mode</div>
                <div className="rc-pill teal">{modeMeta.icon}{modeMeta.label}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                {MODE_OPTIONS.map((option) => {
                  const isSelected = option.id === resolvedMode;
                  return (
                    <button
                      key={option.id}
                      onClick={() => void handleModeSelect(option.id)}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: isSelected ? "1px solid rgba(139,125,251,0.55)" : "1px solid var(--line)",
                        background: isSelected ? "linear-gradient(180deg, rgba(139,125,251,0.18), rgba(45,212,191,0.05))" : "rgba(255,255,255,0.03)",
                        color: "var(--ink-0)",
                        cursor: "pointer",
                        boxShadow: isSelected ? "var(--sh-glow-v)" : "none",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, marginBottom: 3 }}>{option.label}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {modeMeta.capabilities.map(([l, v, i]) => (
                  <div key={String(l)} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)", fontSize: 11.5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 10, marginBottom: 2 }}>{i}{l}</div>
                    <div>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "9px 11px", borderRadius: 8, fontSize: 11.5, lineHeight: 1.5, background: "rgba(45,212,191,0.06)", border: "1px solid rgba(45,212,191,0.25)", color: "var(--ink-1)" }}>
                {modeMeta.notice}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "var(--ink-3)" }}>
                Selected: <span style={{ color: "var(--ink-0)" }}>{selectedModeOption.label}</span>. You can switch modes without regenerating the persona.
              </div>
            </div>
            <div className="rc-glass" style={{ padding: 16, display: "flex", flexDirection: "column" }}>
              <div className="rc-label" style={{ marginBottom: 10 }}>Agent reasoning log</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {resolvedAgentLog.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 11.5, lineHeight: 1.4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 99, background: l.color, marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <span style={{ color: l.color, fontWeight: 600, marginRight: 6 }}>{l.agent}</span>
                      <span style={{ color: "var(--ink-2)" }}>{l.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
