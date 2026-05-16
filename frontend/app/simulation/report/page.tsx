"use client";
import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useSimulationStore } from "@/stores/simulationStore";
import { PRIVACY_NOTICE } from "@/lib/constants";

const MOCK_REPORT = {
  overall_score: 78, persona_name: "Margaret Lewis", duration: "5:42", mode: "video", industry: "Healthcare", difficulty: "Medium",
  skill_scores: { "Empathy": 86, "Clarity": 80, "Active listening": 74, "Safety / escalation": 58, "Professionalism": 84, "Turn-taking": 76, "Video presence": 71, "Pace control": 68 },
  key_moments: [
    { timestamp: "00:42", position_pct: 0.07, type: "strong", title: "Strong empathy opening", excerpt: "I can hear this has been a worrying time." },
    { timestamp: "01:18", position_pct: 0.22, type: "improve", title: "Missed clarifying question", excerpt: "Got it, let me know which pill..." },
    { timestamp: "02:05", position_pct: 0.36, type: "risk", title: "Dizziness mention missed", excerpt: "I've been a little dizzy..." },
    { timestamp: "02:41", position_pct: 0.47, type: "risk", title: "Escalation opportunity missed", excerpt: "…and I felt this tightness in my chest…", score_impact: -12, why_it_mattered: "Chest tightness after surgery is a red flag for cardiac or pulmonary complications.", better_response: "Because you mentioned chest tightness after surgery, I need to connect you with urgent clinical support right away. I'm going to stay with you while we get the right person involved." },
    { timestamp: "03:20", position_pct: 0.58, type: "question", title: "Good clarifying question", excerpt: "Can you tell me where the tightness was?" },
    { timestamp: "04:30", position_pct: 0.80, type: "strong", title: "Clear next steps", excerpt: "I'm going to connect you with our clinical team." },
  ],
  annotated_transcript: [
    { speaker: "You", timestamp: "00:42", text: "I can hear this has been a worrying time. Let me help you through this step by step.", tag: "strong", tag_label: "Strong empathy" },
    { speaker: "Margaret", timestamp: "01:05", text: "I just got home yesterday and they gave me so many bottles…" },
    { speaker: "You", timestamp: "01:18", text: "Got it, let me know which pill you're asking about.", tag: "improve", tag_label: "Missed clarifying question — was she dizzy?" },
    { speaker: "Margaret", timestamp: "02:05", text: "I've been a little dizzy, but I think it's just from the surgery." },
    { speaker: "Margaret", timestamp: "02:41", text: "…and I felt this tightness in my chest, but I wasn't sure if it was from the surgery.", tag: "risk", tag_label: "Critical red flag mentioned" },
    { speaker: "You", timestamp: "02:45", text: "Okay, and were you taking the white pill in the morning or evening?", tag: "risk", tag_label: "Missed escalation — continued with medication question" },
    { speaker: "You", timestamp: "03:20", text: "Can you tell me where the tightness was and when it started?", tag: "question", tag_label: "Good clarifying question (slightly late)" },
  ],
  multimodal_insights: [
    { label: "Eye-contact estimate", value: "62%", note: "steady", tone: "warn" },
    { label: "Speaking pace", value: "164 wpm", note: "slightly fast", tone: "warn" },
    { label: "Facial engagement", value: "consistent", tone: "ok" },
    { label: "Camera presence", value: "centered", tone: "ok" },
    { label: "Filler words", value: "12", note: "um, like, you know", tone: "warn" },
    { label: "Interruptions", value: "3", tone: "warn" },
    { label: "Avg response", value: "18s", tone: "ok" },
    { label: "Longest pause", value: "4.2s", tone: "ok" },
  ],
  coach_feedback: {
    did_well: "Strong empathy, calm tone throughout, and a respectful pace that suited an older patient. Your opening line set a warm anchor.",
    missed: "When Margaret mentioned chest tightness at 02:41, you continued with medication questions for 39 seconds instead of escalating immediately. This is the highest-impact moment of the call.",
    try_next: "3-minute red-flag escalation drill · A harder variant where Margaret reveals symptoms earlier and tries to deflect.",
    next_drill_title: "Red-flag escalation drill (Hard)",
  },
  next_practice: [
    { persona: "margaret", name: "Red-flag escalation drill", difficulty: "Hard", description: "Margaret reveals symptoms earlier and deflects.", why: "Lowest score: escalation 58" },
    { persona: "aanya", name: "Refund · interrupting customer", difficulty: "Hard", description: "Customer talks over you constantly.", why: "Turn-taking has plateaued" },
    { persona: "james", name: "Behavioral · STAR specificity", difficulty: "Medium", description: "Recruiter pushes for concrete examples.", why: "Strongest growth area" },
  ],
};

const TAG_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  strong: { bg: "rgba(52,211,153,0.10)", border: "rgba(52,211,153,0.45)", label: "#6EE7B7" },
  improve: { bg: "rgba(251,191,36,0.10)", border: "rgba(251,191,36,0.45)", label: "#FCD34D" },
  risk: { bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.45)", label: "#FCA5A5" },
  question: { bg: "rgba(79,124,255,0.10)", border: "rgba(79,124,255,0.45)", label: "#93B4FF" },
};

const MOMENT_COLORS: Record<string, string> = { strong: "#6EE7B7", improve: "#FCD34D", risk: "#FCA5A5", question: "#93B4FF" };

function ScoreTile({ l, v, tone, hot }: { l: string; v: number; tone: string; hot?: boolean }) {
  const colors: Record<string, string> = { ok: "#6EE7B7", warn: "#FCD34D", bad: "#FCA5A5", violet: "#B5ACFD", teal: "#5EEAD4", blue: "#93B4FF" };
  const c = colors[tone] || colors.violet;
  return (
    <div style={{ padding: "12px 13px", borderRadius: 10, background: hot ? "linear-gradient(180deg, rgba(248,113,113,0.10), rgba(248,113,113,0.02))" : "rgba(255,255,255,0.03)", border: hot ? "1px solid rgba(248,113,113,0.45)" : "1px solid var(--line)", position: "relative" }}>
      {hot && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 9, color: "#FCA5A5", fontWeight: 600, letterSpacing: "0.05em" }}>FOCUS</div>}
      <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.03em", textTransform: "uppercase" }}>{l}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: c, letterSpacing: "-0.02em" }}>{v}</span>
        <span style={{ fontSize: 11, color: "var(--ink-3)" }}>/100</span>
      </div>
      <div style={{ height: 3, marginTop: 6, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${v}%`, background: c, opacity: 0.8 }} />
      </div>
    </div>
  );
}

export default function ReportPage() {
  const storeReport = useSimulationStore(s => s.report);
  const r = storeReport || MOCK_REPORT;
  const [selectedMoment, setSelectedMoment] = useState(r.key_moments.findIndex((m: any) => m.score_impact));

  const moment = r.key_moments[selectedMoment] as any;

  return (
    <AppShell>
      <TopNav active="Reports" compact />
      <div style={{ flex: 1, padding: "20px 28px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* Header */}
        <div className="rc-glass-2" style={{ padding: "20px 22px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 100% 0%, rgba(139,125,251,0.2), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "center" }}>
            <ScoreRing value={r.overall_score} size={108} thick={9} label="Overall" sub="/ 100" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div className="rc-pill teal"><Icons.video size={10} />{r.mode}</div>
                <div className="rc-pill"><Icons.stethoscope size={10} />{r.industry}</div>
                <div className="rc-pill warn">{r.difficulty}</div>
                <div className="rc-pill"><Icons.clock size={10} />{r.duration}</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Post-discharge patient · {r.persona_name}</div>
              <div style={{ fontSize: 14, color: "var(--ink-1)", marginTop: 8, maxWidth: 720, lineHeight: 1.5 }}>
                <strong style={{ color: "#6EE7B7" }}>Good foundation</strong>, needs stronger escalation. You showed strong empathy and a calm tone, but missed a critical escalation moment when the patient mentioned chest tightness.
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="rc-btn ghost"><Icons.share size={13} />Share</button>
                <button className="rc-btn ghost"><Icons.download size={13} />Export</button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href="/create"><button className="rc-btn"><Icons.retry size={13} />Retry same</button></Link>
                <Link href="/create"><button className="rc-btn primary"><Icons.sparkle size={13} />Practice weak skill</button></Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, minHeight: 0 }}>
          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
            {/* Timeline */}
            <div className="rc-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="rc-label">Key moments · {r.key_moments.length} markers</div>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--ink-2)" }}>
                  {Object.entries(MOMENT_COLORS).map(([k, c]) => <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: c }} />{k}</span>)}
                </div>
              </div>
              <div style={{ position: "relative", height: 44, marginBottom: 14 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 18, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "72%", background: "linear-gradient(90deg,#2DD4BF,#8B7DFB)", borderRadius: 99, opacity: 0.5 }} />
                </div>
                {r.key_moments.map((m: any, i: number) => (
                  <div key={i} onClick={() => setSelectedMoment(i)} style={{ position: "absolute", left: `${m.position_pct * 100}%`, top: selectedMoment === i ? 12 : 14, transform: "translateX(-50%)", width: selectedMoment === i ? 16 : 12, height: selectedMoment === i ? 16 : 12, borderRadius: 99, background: MOMENT_COLORS[m.type] || "#fff", border: selectedMoment === i ? "3px solid white" : "2px solid #0A0E1A", boxShadow: selectedMoment === i ? `0 0 16px ${MOMENT_COLORS[m.type]}` : "none", cursor: "pointer" }} />
                ))}
                <div style={{ position: "absolute", top: 30, left: 0, right: 0, display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-3)" }} className="rc-mono">
                  <span>00:00</span><span>01:30</span><span>03:00</span><span>04:30</span><span>05:42</span>
                </div>
              </div>

              {moment && (
                <div style={{ padding: "14px 16px", borderRadius: 12, background: `linear-gradient(180deg, ${TAG_STYLES[moment.type]?.bg || "rgba(255,255,255,0.03)"}, rgba(0,0,0,0))`, border: `1px solid ${TAG_STYLES[moment.type]?.border || "var(--line)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icons.warn size={14} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: TAG_STYLES[moment.type]?.label }}>{moment.timestamp} · {moment.title}</span>
                    </div>
                    {moment.score_impact && <div className="rc-pill bad">High impact · {moment.score_impact} pts</div>}
                  </div>
                  <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(0,0,0,0.3)", fontSize: 13, lineHeight: 1.5, fontStyle: "italic", color: "var(--ink-1)", marginBottom: 10, borderLeft: `2px solid ${TAG_STYLES[moment.type]?.label || "var(--line)"}` }}>
                    "{moment.excerpt}"
                  </div>
                  {(moment.why_it_mattered || moment.better_response) && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 12.5, lineHeight: 1.5 }}>
                      {moment.why_it_mattered && <div><div style={{ color: "#FCA5A5", fontWeight: 600, fontSize: 11, marginBottom: 4, letterSpacing: "0.05em" }}>WHY IT MATTERED</div><div style={{ color: "var(--ink-1)" }}>{moment.why_it_mattered}</div></div>}
                      {moment.better_response && <div><div style={{ color: "#6EE7B7", fontWeight: 600, fontSize: 11, marginBottom: 4, letterSpacing: "0.05em" }}>BETTER RESPONSE</div><div style={{ color: "var(--ink-1)", fontStyle: "italic" }}>"{moment.better_response}"</div></div>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Transcript */}
            <div className="rc-glass" style={{ padding: 18, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="rc-label">Transcript · annotated</div>
                <div className="rc-tabs"><div className="rc-tab active">All</div><div className="rc-tab">Highlights</div><div className="rc-tab">Missed</div></div>
              </div>
              <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {r.annotated_transcript.map((l: any, i: number) => {
                  const ts = l.tag ? TAG_STYLES[l.tag] : null;
                  return (
                    <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: ts ? ts.bg : "rgba(255,255,255,0.02)", border: ts ? `1px solid ${ts.border}` : "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: l.speaker === "You" ? "#5EEAD4" : "#FCD34D" }}>{l.speaker}</span>
                        <span style={{ fontSize: 10, color: "var(--ink-3)" }} className="rc-mono">{l.timestamp}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-1)", lineHeight: 1.5 }}>{l.text}</div>
                      {ts && <div style={{ fontSize: 11, color: ts.label, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 5, height: 5, borderRadius: 99, background: ts.label }} />{l.tag_label}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0, overflow: "hidden" }}>
            {/* Skill scores */}
            <div className="rc-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="rc-label">Skill scores</div>
                <div className="rc-pill ok"><Icons.arrow size={10} />+6 vs last</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.entries(r.skill_scores).map(([k, v]: [string, any]) => (
                  <ScoreTile key={k} l={k} v={v} tone={v >= 80 ? "teal" : v >= 70 ? "blue" : v >= 60 ? "warn" : "bad"} hot={v < 65} />
                ))}
              </div>
            </div>

            {/* Multimodal insights */}
            <div className="rc-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div className="rc-label">Multimodal insights</div>
                <div style={{ display: "flex", gap: 6 }}><div className="rc-pill"><Icons.video size={10} />Video</div><div className="rc-pill"><Icons.mic size={10} />Audio</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {r.multimodal_insights.map((x: any) => (
                  <div key={x.label} style={{ padding: "8px 10px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid var(--line)" }}>
                    <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{x.label}</div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: x.tone === "ok" ? "#6EE7B7" : x.tone === "warn" ? "#FCD34D" : "#FCA5A5" }} className="rc-mono">{x.value}</span>
                      {x.note && <span style={{ fontSize: 10, color: "var(--ink-3)" }}>{x.note}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 11px", borderRadius: 8, fontSize: 11, lineHeight: 1.5, background: "rgba(79,124,255,0.06)", border: "1px solid rgba(79,124,255,0.25)", color: "var(--ink-2)" }}>
                {PRIVACY_NOTICE}
              </div>
            </div>

            {/* Coach feedback */}
            <div className="rc-glass-2" style={{ padding: 18, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 100% 100%, rgba(45,212,191,0.15), transparent 60%)", pointerEvents: "none" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="rc-label" style={{ display: "flex", alignItems: "center", gap: 6 }}><Icons.sparkle size={11} />Coach feedback</div>
                <div className="rc-pill teal">Coach Agent</div>
              </div>
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: "#6EE7B7", fontWeight: 600, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>What you did well</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-1)", lineHeight: 1.55 }}>{r.coach_feedback.did_well}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: "#FCA5A5", fontWeight: 600, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>What you missed</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-1)", lineHeight: 1.55 }}>{r.coach_feedback.missed}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: "#B5ACFD", fontWeight: 600, marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>Try next</div>
                  <div style={{ padding: "10px 12px", borderRadius: 10, fontSize: 12.5, lineHeight: 1.5, background: "rgba(139,125,251,0.10)", border: "1px solid rgba(139,125,251,0.35)", color: "var(--ink-1)" }}>
                    <strong style={{ color: "#B5ACFD" }}>{r.coach_feedback.next_drill_title}</strong> · {r.coach_feedback.try_next}
                  </div>
                </div>
              </div>
              <Link href="/create"><button className="rc-btn primary" style={{ marginTop: 12, justifyContent: "center", position: "relative" }}><Icons.sparkle size={13} /> Generate escalation drill</button></Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

