"use client";

type PersonaPreset = "margaret" | "james" | "elena" | "david" | "aanya" | "user";
type Mood = "worried" | "angry" | "neutral" | "upbeat" | "confused";

const PRESETS: Record<PersonaPreset, { hair: string; skin: string; shadow: string; shirt: string; accent: string }> = {
  margaret: { hair: "#E8DDD0", skin: "#F4D7C2", shadow: "#D9A685", shirt: "#8AA9C7", accent: "#D8C7E6" },
  james: { hair: "#2A2418", skin: "#E5C8AC", shadow: "#B98A66", shirt: "#1B2B45", accent: "#3A4F75" },
  elena: { hair: "#3D2417", skin: "#E1B68F", shadow: "#A87752", shirt: "#9C5C3A", accent: "#C8854B" },
  david: { hair: "#9C8B7A", skin: "#F0DCC5", shadow: "#C99E78", shirt: "#36465E", accent: "#5C7398" },
  aanya: { hair: "#1B100A", skin: "#D8A878", shadow: "#9C6A40", shirt: "#7A2F4F", accent: "#A85275" },
  user: { hair: "#3A2A1F", skin: "#E8C8A8", shadow: "#B2845E", shirt: "#1F4D54", accent: "#3FA6A0" },
};

const MOOD_BG: Record<Mood, [string, string]> = {
  worried: ["#0F2235", "#1F3F5A"],
  angry: ["#2A1216", "#5A1F26"],
  neutral: ["#1A1E33", "#2C3454"],
  upbeat: ["#1A2E2B", "#205C52"],
  confused: ["#231833", "#3D2A53"],
};

interface PersonaAvatarProps {
  persona?: PersonaPreset;
  size?: number;
  talking?: boolean;
  mood?: Mood;
  halo?: boolean;
}

export function PersonaAvatar({
  persona = "margaret",
  size = 160,
  talking = false,
  mood = "worried",
  halo = false,
}: PersonaAvatarProps) {
  const p = PRESETS[persona] || PRESETS.margaret;
  const [bgStart, bgEnd] = MOOD_BG[mood] || MOOD_BG.neutral;

  return (
    <div
      style={{
        position: "relative", width: size, height: size,
        borderRadius: "var(--r-3)", overflow: "hidden",
        background: `linear-gradient(160deg, ${bgStart} 0%, ${bgEnd} 100%)`,
        boxShadow: halo ? "var(--sh-glow-v)" : undefined,
        flexShrink: 0,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 50% at 50% 30%, rgba(255,255,255,0.12), transparent 60%)" }} />
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        {/* shoulders */}
        <path d="M10 200 C 20 160 70 145 100 145 C 130 145 180 160 190 200 Z" fill={p.shirt} />
        <path d="M10 200 C 20 160 70 145 100 145 C 130 145 180 160 190 200 Z" fill={p.accent} opacity="0.18" />
        {/* neck */}
        <rect x="86" y="120" width="28" height="32" rx="8" fill={p.shadow} />
        <rect x="86" y="120" width="28" height="22" rx="8" fill={p.skin} />
        {/* head */}
        <ellipse cx="100" cy="92" rx="38" ry="44" fill={p.skin} />
        <ellipse cx="100" cy="118" rx="38" ry="14" fill={p.shadow} opacity="0.45" />
        {/* hair */}
        {persona === "margaret" && (
          <g>
            <path d="M62 90 C 60 60 80 42 100 42 C 122 42 142 56 140 86 C 130 76 120 72 110 74 C 100 70 86 72 78 80 C 72 82 66 84 62 90 Z" fill={p.hair} />
            <ellipse cx="100" cy="48" rx="36" ry="14" fill={p.hair} opacity="0.6" />
          </g>
        )}
        {persona === "james" && (
          <path d="M62 86 C 62 56 80 42 100 42 C 122 42 138 58 138 86 L 132 80 C 120 70 100 70 86 76 C 74 80 66 82 62 86 Z" fill={p.hair} />
        )}
        {persona === "elena" && (
          <g>
            <path d="M58 110 C 56 56 80 38 100 38 C 122 38 144 58 142 110 C 138 90 132 80 124 76 L 122 110 L 118 80 C 104 76 92 78 82 82 L 78 110 L 76 78 C 68 80 62 92 58 110 Z" fill={p.hair} />
          </g>
        )}
        {persona === "david" && (
          <path d="M64 86 C 66 64 82 50 100 52 C 116 50 134 64 136 86 C 130 78 120 76 110 76 C 96 74 80 78 64 86 Z" fill={p.hair} />
        )}
        {persona === "aanya" && (
          <g>
            <path d="M58 120 C 54 56 80 38 100 38 C 122 38 146 58 142 120 L 132 88 C 128 78 114 74 100 74 C 86 74 72 78 68 88 L 58 120 Z" fill={p.hair} />
          </g>
        )}
        {persona === "user" && (
          <path d="M64 84 C 64 60 80 46 100 46 C 120 46 136 60 136 84 C 128 76 116 72 100 72 C 84 72 72 76 64 84 Z" fill={p.hair} />
        )}
        {/* eyes */}
        <ellipse cx="86" cy="92" rx="6" ry={mood === "worried" ? 2.2 : 2.8} fill="#fff" />
        <ellipse cx="114" cy="92" rx="6" ry={mood === "worried" ? 2.2 : 2.8} fill="#fff" />
        <circle cx="86" cy="92" r="2.2" fill="#3a2a1a" />
        <circle cx="114" cy="92" r="2.2" fill="#3a2a1a" />
        <path d={mood === "worried" ? "M78 82 L 92 86" : mood === "angry" ? "M78 86 L 92 82" : "M78 84 L 92 84"} stroke="#3a2a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d={mood === "worried" ? "M122 86 L 108 82" : mood === "angry" ? "M122 82 L 108 86" : "M122 84 L 108 84"} stroke="#3a2a1a" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* nose */}
        <path d="M100 96 Q 102 106 100 110 Q 98 112 98 113" stroke={p.shadow} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* mouth */}
        {mood === "angry" ? (
          <path d="M88 122 Q 100 118 112 122" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : mood === "upbeat" ? (
          <path d="M88 118 Q 100 128 112 118" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : mood === "worried" ? (
          <path d="M90 122 Q 100 120 110 122" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M90 121 L 110 121" stroke="#5a1f1f" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {/* glasses for margaret */}
        {persona === "margaret" && (
          <g stroke="#2a2118" strokeWidth="1.4" fill="none">
            <circle cx="86" cy="92" r="10" />
            <circle cx="114" cy="92" r="10" />
            <path d="M96 92 L 104 92" />
          </g>
        )}
        {talking && <ellipse cx="100" cy="125" rx="14" ry="3" fill="#5a1f1f" opacity="0.18" />}
      </svg>
      {talking && (
        <div style={{
          position: "absolute", inset: -2, borderRadius: "var(--r-3)", pointerEvents: "none",
          boxShadow: "0 0 0 2px rgba(45,212,191,0.6), 0 0 24px rgba(45,212,191,0.35)",
          animation: "rc-pulse 1.6s ease-in-out infinite",
        }} />
      )}
    </div>
  );
}
