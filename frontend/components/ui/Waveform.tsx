"use client";

type WaveTone = "teal" | "violet" | "blue" | "warn";
const WAVE_COLORS: Record<WaveTone, string> = { teal: "#2DD4BF", violet: "#8B7DFB", blue: "#4F7CFF", warn: "#FBBF24" };

interface WaveformProps {
  active?: boolean;
  bars?: number;
  tone?: WaveTone;
  height?: number;
  dense?: boolean;
}

export function Waveform({ active = true, bars = 48, tone = "teal", height = 44, dense = false }: WaveformProps) {
  const c = WAVE_COLORS[tone] || WAVE_COLORS.teal;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: dense ? 2 : 3, height }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = (Math.sin(i * 0.7) * 0.5 + Math.cos(i * 1.3) * 0.3 + 0.6) * 0.9 + 0.1;
        const delay = (i % 8) * 0.08;
        return (
          <div
            key={i}
            style={{
              width: dense ? 2 : 3,
              height: `${h * 100}%`,
              minHeight: 3,
              borderRadius: 3,
              background: `linear-gradient(180deg, ${c}, ${c}aa)`,
              opacity: active ? 1 : 0.35,
              animation: active ? `rc-wave 1.${(i % 9) + 1}s ease-in-out ${delay}s infinite` : "none",
              transformOrigin: "center",
            }}
          />
        );
      })}
    </div>
  );
}
