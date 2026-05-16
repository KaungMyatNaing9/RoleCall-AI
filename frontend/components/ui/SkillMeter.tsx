"use client";

type Tone = "violet" | "teal" | "blue" | "warn" | "bad";

const TONES: Record<Tone, [string, string]> = {
  violet: ["#8B7DFB", "#6E5BF0"],
  teal: ["#2DD4BF", "#0FB3A1"],
  blue: ["#7BA1FF", "#4F7CFF"],
  warn: ["#FBBF24", "#F59E0B"],
  bad: ["#F87171", "#DC2626"],
};

interface SkillMeterProps {
  label: string;
  value: number;
  max?: number;
  tone?: Tone;
}

export function SkillMeter({ label, value, max = 100, tone = "violet" }: SkillMeterProps) {
  const [c1, c2] = TONES[tone] || TONES.violet;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, color: "var(--ink-1)", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-0)" }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${(value / max) * 100}%`, borderRadius: 99,
          background: `linear-gradient(90deg, ${c1}, ${c2})`,
          boxShadow: `0 0 16px -2px ${c1}80`,
        }} />
      </div>
    </div>
  );
}
