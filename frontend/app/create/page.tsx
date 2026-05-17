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
  "Healthcare",
  "Customer Service",
  "Sales",
  "HR Interview",
  "Education",
  "Finance",
  "Hospitality",
  "Custom",
];

const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Expert"];

const GENERATION_LABELS: Record<string, string> = {
  idle: "",
  persona: "Creating persona…",
  scenario: "Building scenario…",
  rubric: "Building rubric…",
  agent: "Setting up voice…",
  done: "Done",
};

export default function CreatePage() {
  const router = useRouter();
  const store = useSimulationStore();
  const [selectedIndustry, setSelectedIndustry] = useState("Healthcare");
  const [prompt, setPrompt] = useState(
    "An elderly post-discharge patient who is confused about medication and later mentions chest tightness.",
  );
  const [difficulty, setDifficulty] = useState("Medium");
  const [sliders, setSliders] = useState({ emotional_intensity: 0.4, interruptions: 0.25, hidden_agenda: 0.6, patience: 0.7, escalation_risk: 0.55 });
  const [toggles, setToggles] = useState({ hidden_red_flag: true, random_surprise: true, light_accent: false });
  const [evalFocus, setEvalFocus] = useState(["Empathy", "Clarity", "Active listening", "Escalation", "Turn-taking"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "persona" | "scenario" | "rubric" | "agent" | "done">("idle");

  const suggestions = [
    "Angry customer demanding refund",
    "Bank scammer targeting older adult",
    "Recruiter for SWE intern",
  ];

  const toggleEvalFocus = (item: string) => {
    setEvalFocus((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
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
      store.setAgentLog([
        { agent: "Persona Generator", color: "#5EEAD4", message: `Generated ${persona.name}, ${persona.age}, ${persona.role}. Mood: ${persona.mood}.` },
      ]);

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
      store.setAgentLog([
        { agent: "Persona Generator", color: "#5EEAD4", message: `Generated ${persona.name}, ${persona.age}, ${persona.role}. Mood: ${persona.mood}.` },
        { agent: "Scenario Builder", color: "#93B4FF", message: `${scenario.title} · ${scenario.objective}` },
      ]);

      setAgentStatus("rubric");
      const rubric = await api.generateRubric({
        scenario_id: scenario.id,
        industry: selectedIndustry,
        difficulty,
        mode: "adaptive",
        evaluation_focus: evalFocus,
      });
      store.setRubric(rubric);
      store.setAgentLog([
        { agent: "Persona Generator", color: "#5EEAD4", message: `Generated ${persona.name}, ${persona.age}, ${persona.role}. Mood: ${persona.mood}.` },
        { agent: "Scenario Builder", color: "#93B4FF", message: `${scenario.title} · ${scenario.objective}` },
        { agent: "Rubric Agent", color: "#B5ACFD", message: `Built ${rubric.items.length} criteria from focus: ${evalFocus.join(", ")}.` },
      ]);
      store.setSimulationId(`session-${Date.now()}`);

      setAgentStatus("done");
      setTimeout(() => router.push("/simulation/preview"), 400);
    } catch (e) {
      console.error(e);
      setGenerateError(
        e instanceof Error
          ? e.message
          : "Could not reach the backend. Start the API server and try again.",
      );
      setAgentStatus("idle");
    } finally {
      setIsGenerating(false);
    }
  };

  const statusLabel = GENERATION_LABELS[agentStatus];
  const agents = [
    { n: "Persona Generator", s: agentStatus === "persona" ? "working" : agentStatus === "idle" ? "queued" : "done", i: <Icons.user size={11} /> },
    { n: "Scenario Builder", s: agentStatus === "scenario" ? "working" : ["idle", "persona"].includes(agentStatus) ? "queued" : "done", i: <Icons.flag size={11} /> },
    { n: "Rubric Agent", s: agentStatus === "rubric" ? "working" : ["idle", "persona", "scenario"].includes(agentStatus) ? "queued" : "done", i: <Icons.check size={11} /> },
    { n: "Simulation Agent", s: agentStatus === "done" ? "done" : ["idle", "persona", "scenario", "rubric"].includes(agentStatus) ? "queued" : "working", i: <Icons.mic size={11} /> },
  ];

  return (
    <AppShell>
      <TopNav active="New" compact />
      <main style={{ flex: 1, padding: "28px", maxWidth: 720, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rc-btn ghost sm"
          style={{ marginBottom: 20 }}
        >
          ← Back
        </button>

        <h1 className="rc-h-2" style={{ margin: "0 0 28px" }}>
          New simulation
        </h1>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: "0 0 10px" }}>
            Industry
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INDUSTRIES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedIndustry(id)}
                className="rc-btn sm"
                style={{
                  background:
                    id === selectedIndustry
                      ? "rgba(45,212,191,0.12)"
                      : "rgba(255,255,255,0.04)",
                  borderColor:
                    id === selectedIndustry ? "rgba(45,212,191,0.5)" : undefined,
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: "0 0 10px" }}>
            Persona
          </h2>
          <textarea
            className="rc-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ minHeight: 100, resize: "vertical" }}
            placeholder="Who will you practice with? Role, mood, hidden concerns…"
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="rc-pill"
                style={{ cursor: "pointer", border: "none" }}
                onClick={() => setPrompt(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: "0 0 10px" }}>
            Difficulty
          </h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {DIFFICULTY_LEVELS.map((d) => (
              <button
                key={d}
                type="button"
                className="rc-btn sm"
                onClick={() => setDifficulty(d)}
                style={{
                  background:
                    d === difficulty ? "rgba(139,125,251,0.2)" : "rgba(255,255,255,0.04)",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: "0 0 10px" }}>
            What to evaluate
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EVALUATION_CRITERIA.map((c) => {
              const on = evalFocus.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleEvalFocus(c)}
                  className="rc-pill"
                  style={{
                    cursor: "pointer",
                    border: "none",
                    background: on ? "rgba(139,125,251,0.15)" : "rgba(255,255,255,0.04)",
                    color: on ? "#B5ACFD" : "var(--ink-2)",
                  }}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {isGenerating && (
          <div className="rc-glass" style={{ padding: 14, marginBottom: 16 }}>
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
        )}
        <button
          type="button"
          className="rc-btn primary lg"
          style={{
            width: "100%",
            justifyContent: "center",
            opacity: isGenerating ? 0.7 : 1,
          }}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>Generating…</>
          ) : (
            <>
              <Icons.sparkle size={14} /> Generate
            </>
          )}
        </button>

        {statusLabel && (
          <p style={{ marginTop: 12, fontSize: 13, color: "var(--ink-2)", textAlign: "center" }}>
            {statusLabel}
          </p>
        )}
        {generateError && (
          <p style={{ marginTop: 12, fontSize: 13, color: "#FCA5A5", textAlign: "center" }}>
            {generateError}
          </p>
        )}
      </main>
    </AppShell>
  );
}
