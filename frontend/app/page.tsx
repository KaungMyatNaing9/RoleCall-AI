"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/layout/Logo";
import { Icons } from "@/components/icons";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkillMeter } from "@/components/ui/SkillMeter";
import { Waveform } from "@/components/ui/Waveform";

const FEATURES = [
  { icon: <Icons.user size={18} />, t: "Generate Personas", d: "Create patients, customers, interviewers, clients, or scammers from a prompt or document.", tone: "violet" },
  { icon: <Icons.video size={18} />, t: "Practice by Voice or Video", d: "Phone-style calls, browser voice calls, or full video call simulations.", tone: "teal" },
  { icon: <Icons.signal size={18} />, t: "Multimodal Feedback", d: "Review transcript, tone, pace, interruptions, eye-contact estimate, and nonverbal cues.", tone: "blue" },
  { icon: <Icons.chart size={18} />, t: "Improve Over Time", d: "Track readiness, weak areas, and progress across repeated practice sessions.", tone: "violet" },
];

const INDUSTRIES = [
  { n: "Healthcare", i: <Icons.stethoscope size={16} />, c: "rgba(45,212,191,0.18)", tc: "#5EEAD4" },
  { n: "Customer Service", i: <Icons.heart size={16} />, c: "rgba(248,113,113,0.18)", tc: "#FCA5A5" },
  { n: "Sales", i: <Icons.chart size={16} />, c: "rgba(79,124,255,0.18)", tc: "#93B4FF" },
  { n: "Interviews", i: <Icons.briefcase size={16} />, c: "rgba(139,125,251,0.18)", tc: "#B5ACFD" },
  { n: "Education", i: <Icons.book size={16} />, c: "rgba(251,191,36,0.18)", tc: "#FCD34D" },
  { n: "Finance", i: <Icons.bank size={16} />, c: "rgba(110,231,183,0.18)", tc: "#A7F3D0" },
  { n: "Hospitality", i: <Icons.hotel size={16} />, c: "rgba(244,114,182,0.18)", tc: "#F9A8D4" },
];

export default function LandingPage() {
  return (
    <AppShell>
      {/* Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 56px", position: "relative", zIndex: 5 }}>
        <Logo />
        <nav style={{ display: "flex", gap: 6 }}>
          {["Product", "Solutions", "Templates", "Pricing", "Docs"].map(x => (
            <div key={x} style={{ padding: "7px 14px", fontSize: 13.5, color: "var(--ink-1)", cursor: "pointer" }}>{x}</div>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href="/dashboard"><button className="rc-btn ghost sm">Sign in</button></Link>
          <Link href="/create"><button className="rc-btn primary sm">Start free</button></Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, padding: "40px 56px 0", alignItems: "center" }}>
        <div>
          <div className="rc-pill violet" style={{ marginBottom: 24 }}>
            <Icons.sparkle size={12} /> <span>Multi-agent communication training</span>
          </div>
          <h1 className="rc-h-display" style={{ margin: 0, fontSize: 72 }}>
            Practice the<br />
            <span className="rc-logo-grad">conversations</span><br />
            that matter before<br />
            they happen.
          </h1>
          <p style={{ fontSize: 18, color: "var(--ink-1)", maxWidth: 520, lineHeight: 1.55, marginTop: 24 }}>
            Generate realistic AI callers, patients, customers, interviewers, and clients — then practice by voice or video and receive instant, structured coaching feedback.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Link href="/create">
              <button className="rc-btn primary lg"><Icons.video size={16} /> Start Simulation</button>
            </Link>
            <Link href="/simulation/report">
              <button className="rc-btn lg"><Icons.play size={12} /> View Demo Report</button>
            </Link>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 36, color: "var(--ink-2)", fontSize: 12.5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icons.shield size={14} /> SOC 2 · HIPAA-ready</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icons.check size={14} /> No card required</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icons.team size={14} /> 1-click team setup</div>
          </div>
        </div>

        {/* Right mock */}
        <div style={{ position: "relative", height: 480 }}>
          <div className="rc-glass-2" style={{ position: "absolute", left: 0, top: 18, width: 380, height: 360, padding: 14, borderRadius: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="rc-pill teal">
                <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4BF", display: "inline-block", animation: "rc-pulse 1.4s infinite" }} />
                LIVE · 02:14
              </div>
              <div className="rc-pill">Healthcare</div>
            </div>
            <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", height: 230, background: "#0F1424" }}>
              <PersonaAvatar persona="margaret" size={306} talking mood="worried" />
              <div style={{ position: "absolute", top: 10, left: 10 }} className="rc-pill">
                <Icons.user size={10} /> Margaret L. · Patient
              </div>
              <div style={{ position: "absolute", bottom: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ background: "rgba(0,0,0,0.55)", padding: "5px 10px", borderRadius: 8, fontSize: 11 }}>
                  <span style={{ color: "var(--ink-2)" }}>Mood</span> <span style={{ color: "#FCD34D" }}>· worried</span>
                </div>
                <Waveform tone="teal" bars={20} height={20} dense />
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <div className="rc-pill"><Icons.mic size={11} /> Trainee</div>
              <Waveform tone="violet" bars={26} height={18} dense />
              <span style={{ fontSize: 11, color: "var(--ink-3)" }} className="rc-mono">62%</span>
            </div>
          </div>

          <div className="rc-glass-2" style={{ position: "absolute", right: 0, bottom: 0, width: 380, height: 380, padding: 18, borderRadius: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div className="rc-label">Live coaching · session</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>Post-discharge call</div>
              </div>
              <ScoreRing value={78} size={64} thick={6} label="LIVE" />
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <SkillMeter label="Empathy" value={86} tone="teal" />
              <SkillMeter label="Clarity" value={80} tone="blue" />
              <SkillMeter label="Active listening" value={74} tone="violet" />
              <SkillMeter label="Safety / escalation" value={58} tone="warn" />
            </div>
            <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ color: "#FCD34D", marginTop: 1 }}><Icons.warn size={14} /></div>
              <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                <div style={{ fontWeight: 600, color: "#FCD34D", marginBottom: 2 }}>Critical moment</div>
                <div style={{ color: "var(--ink-1)" }}>Patient mentioned chest tightness. Consider escalating before continuing.</div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--ink-2)", display: "flex", gap: 14 }} className="rc-mono">
              <span>168 wpm</span><span>3 interruptions</span><span>4 clarifiers</span><span>62% eye</span>
            </div>
          </div>

          <div style={{ position: "absolute", top: 0, right: 120 }}>
            <div className="rc-pill violet" style={{ boxShadow: "var(--sh-glow-v)" }}>
              <Icons.sparkle size={10} /> Coach Agent · suggested next line
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ padding: "40px 56px 28px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {FEATURES.map((f, i) => (
          <div key={i} className="rc-glass" style={{ padding: "18px 18px 20px" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", marginBottom: 14, background: f.tone === "teal" ? "rgba(45,212,191,0.12)" : f.tone === "blue" ? "rgba(79,124,255,0.14)" : "rgba(139,125,251,0.14)", color: f.tone === "teal" ? "#5EEAD4" : f.tone === "blue" ? "#93B4FF" : "#B5ACFD" }}>{f.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{f.t}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>{f.d}</div>
          </div>
        ))}
      </div>

      {/* Industry strip */}
      <div style={{ padding: "0 56px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="rc-label">Built for every conversation</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>7 industries · 80+ template scenarios</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 10 }}>
          {INDUSTRIES.map(x => (
            <div key={x.n} className="rc-glass" style={{ padding: 14, textAlign: "center" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, margin: "0 auto 8px", background: x.c, color: x.tc, display: "grid", placeItems: "center" }}>{x.i}</div>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{x.n}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
