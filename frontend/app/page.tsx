"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/layout/Logo";
import { Icons } from "@/components/icons";

export default function LandingPage() {
  return (
    <AppShell>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", position: "relative", zIndex: 5 }}>
        <Logo />
        <Link href="/create">
          <button className="rc-btn primary">New simulation</button>
        </Link>
      </header>

      <section style={{ maxWidth: 640, padding: "48px 40px 80px" }}>
        <h1 className="rc-h-1" style={{ margin: 0, fontSize: 48, lineHeight: 1.08 }}>
          Practice difficult conversations before they happen.
        </h1>
        <p style={{ fontSize: 17, color: "var(--ink-1)", lineHeight: 1.6, marginTop: 20 }}>
          Create an AI persona, run a voice or video simulation, and get coaching feedback on what you said and how you showed up.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <Link href="/create">
            <button className="rc-btn primary lg"><Icons.video size={16} /> Start simulation</button>
          </Link>
          <Link href="/dashboard">
            <button className="rc-btn lg">Open home</button>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
