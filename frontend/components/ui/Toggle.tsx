"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}
    >
      {label && <span style={{ color: "var(--ink-0)" }}>{label}</span>}
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 32, height: 18, borderRadius: 99,
          background: checked ? "linear-gradient(90deg,#2DD4BF,#8B7DFB)" : "rgba(255,255,255,0.1)",
          position: "relative", cursor: "pointer", border: "none", padding: 0,
          transition: "background .15s",
        }}
      >
        <div style={{
          position: "absolute", top: 2, left: checked ? 16 : 2,
          width: 14, height: 14, borderRadius: 99, background: "#fff",
          transition: "left .15s",
        }} />
      </button>
    </div>
  );
}
