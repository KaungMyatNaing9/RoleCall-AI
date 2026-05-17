"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

export function BackendStatus({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then((payload) => {
        if (cancelled) return;
        setState(payload.status === "ok" ? "ok" : "error");
        setVersion(payload.version ?? null);
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    state === "loading"
      ? "Checking API…"
      : state === "ok"
        ? `API online${version ? ` · v${version}` : ""}`
        : "API offline — start the backend on port 8000";

  const color =
    state === "ok" ? "#6EE7B7" : state === "error" ? "#FCA5A5" : "var(--ink-3)";

  if (compact) {
    return (
      <span style={{ fontSize: 11, color, display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 99,
            background: color,
            boxShadow: state === "ok" ? `0 0 8px ${color}` : "none",
          }}
        />
        {label}
      </span>
    );
  }

  return (
    <div
      className="rc-glass"
      style={{
        padding: "12px 14px",
        marginBottom: 20,
        fontSize: 13,
        color,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          background: color,
          flexShrink: 0,
        }}
      />
      {label}
    </div>
  );
}
