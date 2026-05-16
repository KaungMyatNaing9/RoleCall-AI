"use client";
import Link from "next/link";
import { Logo } from "./Logo";
import { Icons } from "@/components/icons";

const NAV_ITEMS = [
  { label: "Simulations", href: "/dashboard" },
  { label: "Templates", href: "/dashboard" },
  { label: "Reports", href: "/simulation/report" },
  { label: "Progress", href: "/progress" },
  { label: "Team", href: "/dashboard" },
  { label: "Settings", href: "/dashboard" },
];

interface TopNavProps {
  active?: string;
  compact?: boolean;
}

export function TopNav({ active, compact = false }: TopNavProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: compact ? "12px 22px" : "16px 28px",
        borderBottom: "1px solid var(--line)",
        background: "rgba(10,14,26,0.6)",
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Logo size={22} />
        </Link>
        <nav style={{ display: "flex", gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "7px 12px",
                  borderRadius: 8,
                  fontSize: 13.5,
                  fontWeight: item.label === active ? 600 : 500,
                  color: item.label === active ? "var(--ink-0)" : "var(--ink-2)",
                  background: item.label === active ? "rgba(255,255,255,0.06)" : "transparent",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="rc-pill" style={{ background: "rgba(45,212,191,0.08)", borderColor: "rgba(45,212,191,0.3)" }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: "#2DD4BF", display: "inline-block" }} />
          <span style={{ color: "#5EEAD4" }}>Day 14 streak</span>
        </div>
        <button className="rc-btn ghost sm"><Icons.bell size={14} /></button>
        <button className="rc-btn ghost sm"><Icons.search size={14} /></button>
        <div
          style={{
            width: 32, height: 32, borderRadius: 99, marginLeft: 4,
            background: "linear-gradient(135deg,#2DD4BF,#8B7DFB)",
            display: "grid", placeItems: "center", color: "#06241F",
            fontSize: 12, fontWeight: 700,
          }}
        >
          AK
        </div>
      </div>
    </div>
  );
}
