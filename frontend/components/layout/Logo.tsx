"use client";
import { Icons } from "@/components/icons";

export function Logo({ size = 22, showText = true }: { size?: number; showText?: boolean }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <Icons.logo size={size} />
      {showText && (
        <span style={{ fontWeight: 700, fontSize: size * 0.78, letterSpacing: "-0.02em", color: "var(--ink-0)" }}>
          Role<span className="rc-logo-grad">Call</span>{" "}
          <span style={{ color: "var(--ink-2)", fontWeight: 500, marginLeft: 1 }}>AI</span>
        </span>
      )}
    </div>
  );
}
