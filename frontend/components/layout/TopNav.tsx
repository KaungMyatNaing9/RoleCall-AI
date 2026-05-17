"use client";
import Link from "next/link";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard" },
  { label: "New", href: "/create" },
  { label: "Report", href: "/simulation/report" },
];

interface TopNavProps {
  active?: string;
  compact?: boolean;
}

export function TopNav({ active, compact = false }: TopNavProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        padding: compact ? "12px 24px" : "14px 28px",
        borderBottom: "1px solid var(--line)",
        background: "rgba(10,14,26,0.6)",
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 5,
      }}
    >
      <Link href="/dashboard" style={{ textDecoration: "none", marginRight: 28 }}>
        <Logo size={22} />
      </Link>
      <nav style={{ display: "flex", gap: 4 }}>
        {NAV_ITEMS.map((item) => (
          <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: item.label === active ? 600 : 500,
                color: item.label === active ? "var(--ink-0)" : "var(--ink-2)",
                background: item.label === active ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
