"use client";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import Link from "next/link";

const KPIS = [
  { l: "Readiness", v: 78, d: "+8", tone: "teal" },
  { l: "Empathy", v: 82, d: "+5", tone: "teal" },
  { l: "Escalation", v: 68, d: "+11", tone: "warn", hot: true },
  { l: "Confidence", v: 74, d: "+4", tone: "violet" },
  { l: "Video presence", v: 71, d: "+2", tone: "violet" },
];

function SkillRadar() {
  const axes = ["Empathy", "Clarity", "Listen", "Escalation", "Pace", "Eye contact", "Confidence", "Pro."];
  const cur = [82, 80, 74, 68, 72, 62, 74, 84];
  const old = [77, 72, 70, 57, 65, 55, 70, 80];
  const cx = 140, cy = 140, r = 100;
  const n = axes.length;
  const pt = (val: number, i: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rad = (val / 100) * r;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
  };
  const poly = (arr: number[]) => arr.map((v, i) => pt(v, i).join(",")).join(" ");
  return (
    <svg viewBox="0 0 280 280" width="100%" height="220">
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon key={s} points={axes.map((_, i) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + Math.cos(a) * r * s, cy + Math.sin(a) * r * s].join(","); }).join(" ")} fill="none" stroke="rgba(255,255,255,0.06)" />
      ))}
      {axes.map((_, i) => { const [x, y] = pt(100, i); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" />; })}
      <polygon points={poly(old)} fill="rgba(45,212,191,0.12)" stroke="#2DD4BF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
      <polygon points={poly(cur)} fill="rgba(139,125,251,0.22)" stroke="#8B7DFB" strokeWidth="2" />
      {cur.map((v, i) => { const [x, y] = pt(v, i); return <circle key={i} cx={x} cy={y} r="3" fill="#8B7DFB" />; })}
      {axes.map((l, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + Math.cos(a) * (r + 18);
        const ly = cy + Math.sin(a) * (r + 18) + 3;
        return <text key={i} x={lx} y={ly} fontSize="10" fill="rgba(255,255,255,0.7)" textAnchor="middle">{l}</text>;
      })}
    </svg>
  );
}

export default function ProgressPage() {
  return (
    <AppShell>
      <TopNav active="Progress" compact />
      <div style={{ flex: 1, padding: "22px 28px", overflow: "hidden", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div className="rc-label" style={{ marginBottom: 4 }}>30-day progress</div>
            <h1 className="rc-h-1" style={{ margin: 0 }}>Your communication is sharpening</h1>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 4 }}>
              <span style={{ color: "#6EE7B7" }}>+8 readiness</span> · 14 sessions · 3 weak skills tracked
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="rc-tabs">
              {["7d", "30d", "90d", "All"].map((t, i) => (
                <div key={t} className={`rc-tab ${i === 1 ? "active" : ""}`}>{t}</div>
              ))}
            </div>
            <button className="rc-btn ghost"><Icons.download size={13} />Export</button>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
          {KPIS.map(k => (
            <div key={k.l} className="rc-glass" style={{ padding: 14, position: "relative" }}>
              {k.hot && <div style={{ position: "absolute", top: 8, right: 10, fontSize: 9, color: "#FCD34D", fontWeight: 600, letterSpacing: "0.05em" }}>BIGGEST GAIN</div>}
              <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{k.l}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em" }}>{k.v}</span>
                <span style={{ fontSize: 11.5, color: "#6EE7B7", fontWeight: 600 }}>↑ {k.d}</span>
              </div>
              <svg viewBox="0 0 100 24" width="100%" height="24" style={{ marginTop: 4 }}>
                <path d="M 0 20 L 12 18 L 24 16 L 36 17 L 48 12 L 60 10 L 72 8 L 84 6 L 100 4" fill="none" stroke={k.tone === "teal" ? "#2DD4BF" : k.tone === "warn" ? "#FBBF24" : "#8B7DFB"} strokeWidth="1.5" />
              </svg>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, minHeight: 0 }}>
          <div style={{ display: "grid", gridTemplateRows: "1.2fr 1fr", gap: 14, minHeight: 0 }}>
            {/* Trend chart */}
            <div className="rc-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="rc-label">Skill trends</div>
                <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                  {[["#8B7DFB", "Readiness"], ["#2DD4BF", "Empathy"], ["#FBBF24", "Escalation"], ["#4F7CFF", "Clarity"]].map(([c, l]) => (
                    <span key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 2, background: c }} />{l}</span>
                  ))}
                </div>
              </div>
              <svg viewBox="0 0 600 220" width="100%" preserveAspectRatio="none" style={{ minHeight: 160 }}>
                <defs><linearGradient id="pgrad" x1="0" y1="0" x2="0" y2="220"><stop offset="0" stopColor="#8B7DFB" stopOpacity="0.25" /><stop offset="1" stopColor="#8B7DFB" stopOpacity="0" /></linearGradient></defs>
                {[20, 50, 80].map((y, i) => (
                  <g key={i}>
                    <line x1="30" x2="600" y1={20 + i * 60} y2={20 + i * 60} stroke="rgba(255,255,255,0.05)" />
                    <text x="6" y={24 + i * 60} fontSize="9" fill="rgba(255,255,255,0.3)" fontFamily="JetBrains Mono">{100 - i * 30}</text>
                  </g>
                ))}
                <path d="M 30 130 L 90 122 L 150 110 L 210 108 L 270 96 L 330 84 L 390 76 L 450 62 L 510 54 L 600 48 L 600 220 L 30 220 Z" fill="url(#pgrad)" />
                <path d="M 30 130 L 90 122 L 150 110 L 210 108 L 270 96 L 330 84 L 390 76 L 450 62 L 510 54 L 600 48" fill="none" stroke="#8B7DFB" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M 30 96 L 90 92 L 150 84 L 210 80 L 270 76 L 330 72 L 390 64 L 450 58 L 510 50 L 600 36" fill="none" stroke="#2DD4BF" strokeWidth="2" strokeLinejoin="round" />
                <path d="M 30 160 L 90 158 L 150 154 L 210 148 L 270 142 L 330 130 L 390 122 L 450 110 L 510 96 L 600 84" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 3" />
                <path d="M 30 110 L 90 108 L 150 100 L 210 96 L 270 92 L 330 86 L 390 80 L 450 76 L 510 68 L 600 60" fill="none" stroke="#4F7CFF" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ink-3)", marginTop: 4, paddingLeft: 30 }} className="rc-mono">
                <span>Apr 16</span><span>Apr 23</span><span>Apr 30</span><span>May 7</span><span>May 14</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="rc-glass" style={{ padding: 16 }}>
                <div className="rc-label" style={{ marginBottom: 10 }}>Most common mistakes</div>
                {[
                  { n: "Missed escalation", c: 6, max: 14, bad: true },
                  { n: "Too many filler words", c: 5, max: 14 },
                  { n: "Weak closing summary", c: 4, max: 14 },
                  { n: "Interrupted caller", c: 3, max: 14 },
                  { n: "Did not verify identity", c: 2, max: 14 },
                ].map(m => (
                  <div key={m.n} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, marginBottom: 8 }}>
                    <span style={{ flex: 1, color: "var(--ink-1)" }}>{m.n}</span>
                    <div style={{ width: 80, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(m.c / m.max) * 100}%`, background: m.bad ? "#F87171" : "#FBBF24" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--ink-3)", width: 34, textAlign: "right" }} className="rc-mono">{m.c} / {m.max}</span>
                  </div>
                ))}
              </div>
              <div className="rc-glass" style={{ padding: 16 }}>
                <div className="rc-label" style={{ marginBottom: 10 }}>Most improved</div>
                {[
                  { n: "Escalation", d: "+11" },
                  { n: "De-escalation phrases", d: "+9" },
                  { n: "Empathy", d: "+5" },
                  { n: "STAR specificity", d: "+5" },
                  { n: "Pace control", d: "+3" },
                ].map(m => (
                  <div key={m.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12.5, marginBottom: 9 }}>
                    <span style={{ color: "var(--ink-1)" }}>{m.n}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Icons.arrow size={12} /><span style={{ color: "#6EE7B7", fontWeight: 600 }} className="rc-mono">{m.d}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: radar + recommendations */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
            <div className="rc-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div className="rc-label">Skill radar</div>
                <div style={{ display: "flex", gap: 12, fontSize: 10.5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: "#8B7DFB" }} />Now</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: "#2DD4BF", opacity: 0.5 }} />30d ago</span>
                </div>
              </div>
              <SkillRadar />
            </div>

            <div className="rc-glass" style={{ padding: 18, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div className="rc-label">Recommended next</div>
                <div className="rc-pill violet"><Icons.sparkle size={10} />From Coach Agent</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { p: "margaret" as const, n: "Red-flag escalation drill", d: "Margaret reveals symptoms earlier and deflects.", why: "Lowest score: escalation 58", tone: "bad" },
                  { p: "aanya" as const, n: "Refund · interrupting customer", d: "Customer talks over you constantly.", why: "Turn-taking has plateaued", tone: "warn" },
                  { p: "james" as const, n: "Behavioral · STAR specificity", d: "Recruiter pushes for concrete examples.", why: "Strongest growth area", tone: "violet" },
                ].map(r => (
                  <div key={r.n} style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 11px", borderRadius: 10, cursor: "pointer", background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)" }}>
                    <PersonaAvatar persona={r.p} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{r.n}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 2, lineHeight: 1.4 }}>{r.d}</div>
                      <div style={{ fontSize: 10.5, color: r.tone === "bad" ? "#FCA5A5" : r.tone === "warn" ? "#FCD34D" : "#B5ACFD", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><Icons.sparkle size={9} /> {r.why}</div>
                    </div>
                    <Link href="/create"><button className="rc-btn sm primary" style={{ flexShrink: 0 }}><Icons.arrow size={11} /></button></Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
