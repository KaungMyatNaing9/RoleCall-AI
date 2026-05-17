"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { useSimulationStore } from "@/stores/simulationStore";
import { api } from "@/lib/apiClient";
import { EVALUATION_CRITERIA } from "@/lib/constants";

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
  const [evalFocus, setEvalFocus] = useState([
    "Empathy",
    "Clarity",
    "Active listening",
    "Escalation",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [agentStatus, setAgentStatus] = useState<
    "idle" | "persona" | "scenario" | "rubric" | "agent" | "done"
  >("idle");

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
      store.setMode("video");
      store.setIndustry(selectedIndustry);
      store.setPersonaPrompt(prompt);
      store.setDifficulty(difficulty);
      store.setEvaluationFocus(evalFocus);

      setAgentStatus("persona");
      const persona = await api.generatePersona({
        prompt,
        industry: selectedIndustry,
        difficulty,
      });
      store.setPersona(persona);

      setAgentStatus("scenario");
      const scenario = await api.generateScenario({
        persona_id: persona.id,
        industry: selectedIndustry,
        difficulty,
        mode: "adaptive",
      });
      store.setScenario(scenario);

      setAgentStatus("rubric");
      const rubric = await api.generateRubric({
        scenario_id: scenario.id,
        industry: selectedIndustry,
        evaluation_focus: evalFocus,
      });
      store.setRubric(rubric);
      store.setSimulationId(`session-${Date.now()}`);

      setAgentStatus("agent");
      try {
        const agentResult = await api.createAgent({ persona, scenario, rubric });
        store.setAgentId(agentResult.agent_id);
      } catch (err) {
        console.warn("ElevenLabs agent creation failed:", err);
      }

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
