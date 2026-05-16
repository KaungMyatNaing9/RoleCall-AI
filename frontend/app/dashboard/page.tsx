"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { PersonaAvatar } from "@/components/persona/PersonaAvatar";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SkillMeter } from "@/components/ui/SkillMeter";

const QUICK_START = [
  { n: "Healthcare patient", i: <Icons.stethoscope size={16} />, c: "rgba(45,212,191,0.14)", tc: "#5EEAD4" },
  { n: "Angry customer", i: <Icons.heart size={16} />, c: "rgba(248,113,113,0.14)", tc: "#FCA5A5" },
  { n: "HR interview", i: <Icons.briefcase size={16} />, c: "rgba(139,125,251,0.14)", tc: "#B5ACFD" },
  { n: "Sales objection", i: <Icons.chart size={16} />, c: "rgba(79,124,255,0.14)", tc: "#93B4FF" },
  { n: "Scam defense", i: <Icons.shield size={16} />, c: "rgba(251,191,36,0.14)", tc: "#FCD34D" },
  { n: "Custom persona", i: <Icons.sparkle size={16} />, c: "rgba(139,125,251,0.14)", tc: "#B5ACFD", dashed: true },
];

const SESSIONS = [
  { s: "Post-discharge patient (Margaret)", m: "video", mc: "#5EEAD4", sc: 78, area: "Escalation timing", when: "Just now", live: true },
  { s: "Refund-demanding customer", m: "voice", mc: "#B5ACFD", sc: 71, area: "De-escalation phrases", when: "Yesterday" },
  { s: "SWE intern recruiter mock", m: "video", mc: "#5EEAD4", sc: 84, area: "STAR specificity", when: "2d ago" },
  { s: "Bank verification scam", m: "phone", mc: "#FCD34D", sc: 92, area: "—", when: "3d ago" },
  { s: "Parent-teacher · low grade", m: "video", mc: "#5EEAD4", sc: 69, area: "Active listening", when: "5d ago" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <TopNav active="Simulations" />
      <div style={{ flex: 1, padding: "28px 28px 0", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div className="rc-label" style={{ marginBottom: 6 }}>Welcome back, Alex</div>
              <h1 className="rc-h-1" style={{ margin: 0 }}>Ready for your next conversation?</h1>
              <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 6 }}>You&apos;re 2 sessions away from completing the post-discharge escalation track.</div>
            </div>
            <Link href="/create"><button className="rc-btn primary lg"><Icons.sparkle size={14} /> Start a new simulation</button></Link>
          </div>

          {/* Quick start */}
          <div>
            <div className="rc-label" style={{ marginBottom: 10 }}>Quick start</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10 }}>
              {QUICK_START.map(x => (
                <Link href="/create" key={x.n} style={{ textDecoration: "none" }}>
                  <div className="rc-glass" style={{ padding: "14px 12px", cursor: "pointer", ...(x.dashed ? { borderStyle: "dashed", borderColor: "rgba(139,125,251,0.4)" } : {}) }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, marginBottom: 10, background: x.c, color: x.tc, display: "grid", placeItems: "center" }}>{x.i}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{x.n}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Readiness + Recent sessions */}
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
            <div className="rc-glass" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="rc-label">Communication readiness</div>
                <div style={{ fontSize: 11, color: "var(--ok)" }}>↑ 4 this week</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <ScoreRing value={76} size={90} thick={8} label="Overall" />
                <div style={{ flex: 1, fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  Strongest in <span style={{ color: "#5EEAD4" }}>empathy</span>. Practice <span style={{ color: "#FCD34D" }}>escalation</span> to break 80.
                </div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <SkillMeter label="Clarity" value={82} tone="blue" />
                <SkillMeter label="Empathy" value={76} tone="teal" />
                <SkillMeter label="Escalation" value={68} tone="warn" />
                <SkillMeter label="Confidence" value={74} tone="violet" />
                <SkillMeter label="Video presence" value={71} tone="violet" />
              </div>
            </div>

            <div className="rc-glass" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div className="rc-label">Recent sessions</div>
                <Link href="/progress" style={{ fontSize: 12, color: "var(--ink-2)", cursor: "pointer", textDecoration: "none" }}>View all →</Link>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "var(--ink-3)", fontSize: 11, textAlign: "left", letterSpacing: "0.05em" }}>
                    <th style={{ padding: "6px 0", fontWeight: 500 }}>SCENARIO</th>
                    <th style={{ padding: "6px 0", fontWeight: 500 }}>MODE</th>
                    <th style={{ padding: "6px 0", fontWeight: 500 }}>SCORE</th>
                    <th style={{ padding: "6px 0", fontWeight: 500 }}>IMPROVEMENT AREA</th>
                    <th style={{ padding: "6px 0", fontWeight: 500, textAlign: "right" }}>WHEN</th>
                  </tr>
                </thead>
                <tbody>
                  {SESSIONS.map((r, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--line)" }}>
                      <td style={{ padding: "11px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {r.live && <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4BF", animation: "rc-pulse 1.4s infinite" }} />}
                          <span style={{ fontWeight: r.live ? 600 : 500 }}>{r.s}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 0" }}>
                        <div className="rc-pill" style={{ color: r.mc, borderColor: r.mc + "55" }}>{r.m}</div>
                      </td>
                      <td style={{ padding: "11px 0" }}>
                        <span style={{ fontWeight: 600, color: r.sc >= 80 ? "#6EE7B7" : r.sc >= 70 ? "#FCD34D" : "#FCA5A5" }}>{r.sc}</span>
                        <span style={{ color: "var(--ink-3)", marginLeft: 2 }}>/100</span>
                      </td>
                      <td style={{ padding: "11px 0", color: "var(--ink-1)" }}>{r.area}</td>
                      <td style={{ padding: "11px 0", color: "var(--ink-3)", textAlign: "right" }}>{r.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="rc-glass-2" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 80% at 100% 0%, rgba(139,125,251,0.25), transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div className="rc-label" style={{ marginBottom: 8 }}>Continue training plan</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Post-discharge escalation track</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginBottom: 14 }}>Module 3 of 5 · 8 min remaining</div>
              <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {[1, 1, 1, 0, 0].map((d, i) => (
                  <div key={i} style={{ flex: 1, height: 5, borderRadius: 99, background: d ? "linear-gradient(90deg,#2DD4BF,#8B7DFB)" : "rgba(255,255,255,0.1)" }} />
                ))}
              </div>
              <Link href="/create"><button className="rc-btn primary" style={{ width: "100%" }}><Icons.play size={12} /> Continue with Module 3</button></Link>
            </div>
          </div>

          <div className="rc-glass" style={{ padding: 18 }}>
            <div className="rc-label" style={{ marginBottom: 10 }}>Recommended next practice</div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
              <PersonaAvatar persona="aanya" size={56} mood="angry" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Difficult customer · refund</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-2)", marginTop: 4, lineHeight: 1.5 }}>Aanya P. · Hard difficulty · 6 min</div>
              </div>
              <div className="rc-pill warn">Suggested</div>
            </div>
            <div style={{ padding: "10px 12px", borderRadius: 10, fontSize: 12, lineHeight: 1.5, background: "rgba(139,125,251,0.08)", border: "1px solid rgba(139,125,251,0.25)" }}>
              <div style={{ color: "#B5ACFD", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><Icons.sparkle size={11} /> Why this one</div>
              <div style={{ color: "var(--ink-1)" }}>Your de-escalation and interruption control scored lowest this week. This scenario targets both.</div>
            </div>
            <Link href="/create"><button className="rc-btn" style={{ width: "100%", marginTop: 12 }}>Start practice <Icons.arrow size={14} /></button></Link>
          </div>

          <div className="rc-glass" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="rc-label">Skill trend · 30 days</div>
              <div className="rc-pill ok"><Icons.arrow size={10} /> +8</div>
            </div>
            <svg viewBox="0 0 320 130" width="100%" height="130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="trendgrad" x1="0" y1="0" x2="0" y2="130">
                  <stop offset="0" stopColor="#8B7DFB" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#8B7DFB" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map(i => <line key={i} x1="0" x2="320" y1={20 + i * 30} y2={20 + i * 30} stroke="rgba(255,255,255,0.05)" />)}
              <path d="M0 100 L 30 92 L 60 88 L 90 76 L 120 84 L 150 70 L 180 60 L 210 64 L 240 48 L 270 42 L 300 36 L 320 30 L 320 130 L 0 130 Z" fill="url(#trendgrad)" />
              <path d="M0 100 L 30 92 L 60 88 L 90 76 L 120 84 L 150 70 L 180 60 L 210 64 L 240 48 L 270 42 L 300 36 L 320 30" fill="none" stroke="#8B7DFB" strokeWidth="2" />
              <circle cx="320" cy="30" r="3.5" fill="#8B7DFB" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }} className="rc-mono">
              <span>Apr 16</span><span>Apr 23</span><span>Apr 30</span><span>May 7</span><span>Today</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: 28 }} />
    </AppShell>
  );
}
