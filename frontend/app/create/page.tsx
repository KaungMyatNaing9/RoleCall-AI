"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { useSimulationStore } from "@/stores/simulationStore";
import { api } from "@/lib/apiClient";
import { EVALUATION_CRITERIA } from "@/lib/constants";

const STEPS = [
  { n: 1, t: "Industry" },
  { n: 2, t: "Persona" },
  { n: 3, t: "Difficulty" },
  { n: 4, t: "Evaluation" },
];

const INDUSTRIES = [
  { id: "Healthcare", n: "Healthcare", i: <Icons.stethoscope size={14} /> },
  { id: "Customer Service", n: "Customer Service", i: <Icons.heart size={14} /> },
  { id: "Sales", n: "Sales", i: <Icons.chart size={14} /> },
  { id: "HR Interview", n: "HR Interview", i: <Icons.briefcase size={14} /> },
  { id: "Education", n: "Education", i: <Icons.book size={14} /> },
  { id: "Finance", n: "Finance", i: <Icons.bank size={14} /> },
  { id: "Hospitality", n: "Hospitality", i: <Icons.hotel size={14} /> },
  { id: "Custom", n: "Custom", i: <Icons.sparkle size={14} />, dash: true },
];

const SLIDERS = [
  { l: "Emotional intensity", k: "emotional_intensity", v: 0.4 },
  { l: "Interruptions", k: "interruptions", v: 0.25 },
  { l: "Hidden agenda", k: "hidden_agenda", v: 0.6 },
  { l: "Patience level", k: "patience", v: 0.7 },
  { l: "Escalation risk", k: "escalation_risk", v: 0.55, tone: "warn" as const },
];

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Expert"];

export default function CreatePage() {
  const router = useRouter();
  const store = useSimulationStore();
  const [selectedIndustry, setSelectedIndustry] = useState("Healthcare");
  const [prompt, setPrompt] = useState("An elderly post-discharge patient who is confused about medication and later mentions chest tightness.");
  const [difficulty, setDifficulty] = useState("Medium");
  const [sliders, setSliders] = useState({ emotional_intensity: 0.4, interruptions: 0.25, hidden_agenda: 0.6, patience: 0.7, escalation_risk: 0.55 });
  const [toggles, setToggles] = useState({ hidden_red_flag: true, random_surprise: true, light_accent: false });
  const [evalFocus, setEvalFocus] = useState(["Empathy", "Clarity", "Active listening", "Escalation", "Turn-taking"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "persona" | "scenario" | "rubric" | "done">("idle");

  const suggestions = ["Angry customer demanding refund", "Bank scammer targeting older adult", "Recruiter for SWE intern", "Parent upset about grades"];

  const toggleEvalFocus = (item: string) => {
    setEvalFocus(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError("");
    try {
      store.setIndustry(selectedIndustry);
      store.setPersonaPrompt(prompt);
      store.setDifficulty(difficulty);
      store.setEvaluationFocus(evalFocus);

      setAgentStatus("persona");
      const persona = await api.generatePersona({
        prompt,
        industry: selectedIndustry,
        difficulty,
        behavior_sliders: sliders,
        behavior_toggles: toggles,
      });
      store.setPersona(persona);

      setAgentStatus("scenario");
      const scenario = await api.generateScenario({
        persona_id: persona.id,
        industry: selectedIndustry,
        difficulty,
        mode: "adaptive",
        behavior_sliders: sliders,
        behavior_toggles: toggles,
      });
      store.setScenario(scenario);

      setAgentStatus("rubric");
      const rubric = await api.generateRubric({
        scenario_id: scenario.id,
        industry: selectedIndustry,
        difficulty,
        mode: "adaptive",
        evaluation_focus: evalFocus,
      });
      store.setRubric(rubric);
      store.setSimulationId(`session-${Date.now()}`);

      setAgentStatus("done");
      setTimeout(() => router.push("/simulation/preview"), 400);
    } catch (e) {
      console.error(e);
      setGenerateError(e instanceof Error ? e.message : "Could not reach the backend. Start the API server and try again.");
      setAgentStatus("idle");
    } finally {
      setIsGenerating(false);
    }
  };

  const agents = [
    { n: "Persona Generator", s: agentStatus === "persona" ? "working" : agentStatus === "idle" ? "queued" : "done", i: <Icons.user size={11} /> },
    { n: "Scenario Builder", s: agentStatus === "scenario" ? "working" : ["idle", "persona"].includes(agentStatus) ? "queued" : "done", i: <Icons.flag size={11} /> },
    { n: "Rubric Agent", s: agentStatus === "rubric" ? "working" : ["idle", "persona", "scenario"].includes(agentStatus) ? "queued" : "done", i: <Icons.check size={11} /> },
    { n: "Simulation Agent", s: agentStatus === "done" ? "done" : ["idle", "persona", "scenario", "rubric"].includes(agentStatus) ? "queued" : "working", i: <Icons.mic size={11} /> },
  ];

  return (
    <AppShell>
      <TopNav active="Simulations" compact />
      <div style={{ flex: 1, padding: "24px 28px 0", display: "grid", gridTemplateColumns: "260px 1fr 360px", gap: 24, overflow: "hidden" }}>
        {/* LEFT — Stepper */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-2)", marginBottom: 24 }}>
            <span onClick={() => router.push("/dashboard")} style={{ cursor: "pointer" }}>← Simulations</span>
          </div>
          <div className="rc-label" style={{ marginBottom: 16 }}>Create simulation</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
            {STEPS.map((s, i) => {
              const isActive = s.n === 2;
              const isDone = s.n < 2;
              return (
                <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", position: "relative" }}>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: "absolute", left: 14, top: 34, bottom: -8, width: 1, background: isDone ? "linear-gradient(180deg, #8B7DFB, rgba(139,125,251,0.2))" : "var(--line)" }} />
                  )}
                  <div style={{ width: 28, height: 28, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, flexShrink: 0, background: isActive ? "linear-gradient(135deg,#2DD4BF,#8B7DFB)" : isDone ? "rgba(139,125,251,0.18)" : "rgba(255,255,255,0.05)", color: isActive ? "#06241F" : isDone ? "#B5ACFD" : "var(--ink-2)", border: isActive ? "none" : "1px solid var(--line-2)", boxShadow: isActive ? "var(--sh-glow-v)" : "none" }}>
                    {isDone ? <Icons.check size={13} /> : s.n}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--ink-0)" : isDone ? "var(--ink-1)" : "var(--ink-2)" }}>{s.t}</div>
                    {isActive && <div style={{ fontSize: 11, color: "var(--ink-3)" }}>Describe who you&apos;ll practice with</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent status */}
          <div className="rc-glass" style={{ padding: 14, marginTop: 32 }}>
            <div className="rc-label" style={{ marginBottom: 8 }}>Active agents</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.map(a => (
                <div key={a.n} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, display: "grid", placeItems: "center", background: a.s === "working" ? "rgba(45,212,191,0.15)" : a.s === "done" ? "rgba(139,125,251,0.18)" : "rgba(255,255,255,0.05)", color: a.s === "working" ? "#5EEAD4" : a.s === "done" ? "#B5ACFD" : "var(--ink-3)" }}>{a.i}</div>
                  <span style={{ flex: 1, color: a.s === "working" ? "var(--ink-0)" : "var(--ink-2)" }}>{a.n}</span>
                  {a.s === "working" && <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4BF", animation: "rc-pulse 1.4s infinite" }} />}
                  {a.s === "queued" && <span style={{ fontSize: 10, color: "var(--ink-3)" }}>queued</span>}
                  {a.s === "done" && <Icons.check size={11} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Step 1 */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="rc-label">Step 1 · Industry</div>
              {selectedIndustry && <div className="rc-pill ok"><Icons.check size={10} />{selectedIndustry}</div>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 8 }}>
              {INDUSTRIES.map(c => (
                <div key={c.id} onClick={() => setSelectedIndustry(c.id)} style={{ padding: "10px 8px", borderRadius: 10, textAlign: "center", cursor: "pointer", border: c.id === selectedIndustry ? "1px solid rgba(45,212,191,0.6)" : c.dash ? "1px dashed var(--line-3)" : "1px solid var(--line)", background: c.id === selectedIndustry ? "rgba(45,212,191,0.10)" : "rgba(255,255,255,0.03)" }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, margin: "0 auto 6px", display: "grid", placeItems: "center", background: c.id === selectedIndustry ? "rgba(45,212,191,0.18)" : "rgba(255,255,255,0.04)", color: c.id === selectedIndustry ? "#5EEAD4" : "var(--ink-2)" }}>{c.i}</div>
                  <div style={{ fontSize: 11.5, fontWeight: c.id === selectedIndustry ? 600 : 500, color: c.id === selectedIndustry ? "var(--ink-0)" : "var(--ink-1)" }}>{c.n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div className="rc-label">Step 2 · Generate persona</div>
              <div style={{ display: "flex", gap: 6 }}>
                <div className="rc-pill"><Icons.upload size={11} />Document</div>
                <div className="rc-pill"><Icons.upload size={11} />Patient scenario</div>
              </div>
            </div>
            <div className="rc-glass-2" style={{ padding: 16, position: "relative", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-0)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <Icons.sparkle size={14} /> Describe the person you want to practice with
              </div>
              <textarea
                className="rc-input"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                style={{ minHeight: 80, resize: "vertical" }}
                placeholder="Describe the persona (age, role, emotional state, hidden concerns)..."
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--ink-3)" }}>Suggestions:</span>
                  {suggestions.map(s => (
                    <span key={s} className="rc-pill" style={{ fontSize: 10.5, cursor: "pointer" }} onClick={() => setPrompt(s)}>{s}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="rc-mono">{prompt.length} / 600</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Steps 4+5+CTA */}
        <div style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Step 4 */}
          <div className="rc-glass" style={{ padding: 16 }}>
            <div className="rc-label" style={{ marginBottom: 12 }}>Step 3 · Difficulty &amp; behavior</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "var(--ink-2)", marginBottom: 6 }}>Difficulty</div>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", padding: 3, borderRadius: 8, border: "1px solid var(--line)" }}>
                {DIFFICULTY_LEVELS.map(d => (
                  <div key={d} onClick={() => setDifficulty(d)} style={{ flex: 1, padding: "6px 0", textAlign: "center", fontSize: 11.5, borderRadius: 6, cursor: "pointer", background: d === difficulty ? "rgba(139,125,251,0.25)" : "transparent", color: d === difficulty ? "#B5ACFD" : "var(--ink-2)", fontWeight: d === difficulty ? 600 : 500 }}>{d}</div>
                ))}
              </div>
            </div>
            {SLIDERS.map(s => (
              <div key={s.l} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-2)", marginBottom: 5 }}>
                  <span>{s.l}</span>
                  <span className="rc-mono">{Math.round((sliders as any)[s.k] * 100)}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, position: "relative", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${(sliders as any)[s.k] * 100}%`, borderRadius: 99, background: s.tone === "warn" ? "linear-gradient(90deg,#FBBF24,#F59E0B)" : "linear-gradient(90deg,#2DD4BF,#8B7DFB)" }} />
                  <div style={{ position: "absolute", left: `calc(${(sliders as any)[s.k] * 100}% - 6px)`, top: -3, width: 12, height: 12, borderRadius: 99, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.4)", pointerEvents: "none" }} />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round((sliders as any)[s.k] * 100)}
                  onChange={(e) => setSliders((prev) => ({ ...prev, [s.k]: Number(e.target.value) / 100 }))}
                  style={{ width: "100%" }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
              {(["hidden_red_flag", "random_surprise", "light_accent"] as const).map(k => (
                <div key={k} onClick={() => setToggles(prev => ({ ...prev, [k]: !prev[k] }))} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, padding: "5px 9px", borderRadius: 99, background: toggles[k] ? "rgba(45,212,191,0.10)" : "rgba(255,255,255,0.04)", border: `1px solid ${toggles[k] ? "rgba(45,212,191,0.4)" : "var(--line)"}`, color: toggles[k] ? "#5EEAD4" : "var(--ink-2)", cursor: "pointer" }}>
                  <div style={{ width: 22, height: 12, borderRadius: 99, background: toggles[k] ? "#2DD4BF" : "rgba(255,255,255,0.1)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 1, left: toggles[k] ? 11 : 1, width: 10, height: 10, borderRadius: 99, background: "#fff", transition: "left .15s" }} />
                  </div>
                  {k.replace(/_/g, " ")}
                </div>
              ))}
            </div>
          </div>

          {/* Step 5 */}
          <div className="rc-glass" style={{ padding: 16, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="rc-label">Step 4 · Evaluation focus</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{evalFocus.length} of {EVALUATION_CRITERIA.length}</div>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.5, marginBottom: 10 }}>
              This step only shows mode-neutral coaching priorities. Camera- or voice-specific criteria are added later after you choose phone, voice, video, or text on the preview screen.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EVALUATION_CRITERIA.map(c => {
                const on = evalFocus.includes(c);
                return (
                  <div key={c} onClick={() => toggleEvalFocus(c)} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, padding: "5px 10px", borderRadius: 99, cursor: "pointer", background: on ? "rgba(139,125,251,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${on ? "rgba(139,125,251,0.45)" : "var(--line)"}`, color: on ? "#B5ACFD" : "var(--ink-2)" }}>
                    {on && <Icons.check size={10} />}{c}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            className="rc-btn primary lg"
            style={{ justifyContent: "center", opacity: isGenerating ? 0.7 : 1, cursor: isGenerating ? "wait" : "pointer" }}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? <><span style={{ width: 14, height: 14, borderRadius: 99, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "rc-spin 1s linear infinite" }} /> Generating...</> : <><Icons.sparkle size={14} /> Generate Simulation</>}
          </button>
          {generateError && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#FCA5A5", lineHeight: 1.5, textAlign: "center" }}>
              {generateError}
            </div>
          )}
          <div style={{ fontSize: 11.5, color: "var(--ink-3)", lineHeight: 1.5, textAlign: "center" }}>
            Choose the training mode after generation, once you&apos;ve reviewed the persona, scenario, and rubric.
          </div>
        </div>
      </div>
      <div style={{ height: 28 }} />
    </AppShell>
  );
}
