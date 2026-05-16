"use client";

interface ScoreRingProps {
  value: number;
  size?: number;
  thick?: number;
  label?: string;
  sub?: string;
}

export function ScoreRing({ value = 78, size = 120, thick = 10, label, sub }: ScoreRingProps) {
  const r = (size - thick) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  const gradId = `scoregrad-${size}`;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2={size} y2={size}>
            <stop offset="0" stopColor="#2DD4BF" />
            <stop offset="0.6" stopColor="#4F7CFF" />
            <stop offset="1" stopColor="#8B7DFB" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thick} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${gradId})`} strokeWidth={thick}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: size * 0.32, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
          {label && <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 4, letterSpacing: "0.05em" }}>{label}</div>}
          {sub && <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}
