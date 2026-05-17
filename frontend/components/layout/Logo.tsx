"use client";

export function Logo({ size = 32, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/rolecall-hero-logo.png?v=11"
        alt="RoleCall AI logo"
        width={size}
        height={size}
        style={{ display: "block", width: size, height: size, objectFit: "contain" }}
      />
      {showText && (
        <span style={{ fontWeight: 700, fontSize: size * 0.55, letterSpacing: "-0.02em", color: "var(--ink-0)" }}>
          Role<span className="rc-logo-grad">Call</span>{" "}
          <span style={{ color: "var(--ink-2)", fontWeight: 500, marginLeft: 1 }}>AI</span>
        </span>
      )}
    </div>
  );
}
