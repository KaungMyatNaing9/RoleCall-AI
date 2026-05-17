"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Logo } from "@/components/layout/Logo";
import { Icons } from "@/components/icons";

export default function LandingPage() {
  return (
    <AppShell>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          position: "relative",
          zIndex: 5,
        }}
      >
        <Logo />
        <Link href="/create">
          <button className="rc-btn primary">New simulation</button>
        </Link>
      </header>

      <section
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          alignItems: "center",
          gap: 48,
          padding: "24px 40px 80px",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <h1 className="rc-h-1" style={{ margin: 0, fontSize: 48, lineHeight: 1.08 }}>
            Practice difficult conversations before they happen.
          </h1>
          <p style={{ fontSize: 17, color: "var(--ink-1)", lineHeight: 1.6, marginTop: 20 }}>
            Create an AI persona, run a voice or video simulation, and get coaching feedback on what you said and how you
            showed up.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
            <Link href="/create">
              <button className="rc-btn primary lg">
                <Icons.video size={16} /> Start simulation
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="rc-btn lg">Open home</button>
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            minHeight: 360,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "min(100%, 420px)",
              aspectRatio: "1",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(139,125,251,0.22) 0%, rgba(45,212,191,0.08) 45%, transparent 70%)",
              filter: "blur(2px)",
            }}
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/rolecall-hero-logo.png?v=11"
            alt="RoleCall AI — practice conversations across healthcare, support, business, and education"
            width={420}
            height={420}
            decoding="async"
            style={{
              display: "block",
              width: "min(100%, 440px)",
              height: "auto",
              position: "relative",
              filter: "drop-shadow(0 28px 48px rgba(79, 124, 255, 0.35)) drop-shadow(0 8px 24px rgba(139, 125, 251, 0.25))",
            }}
          />
        </div>
      </section>
    </AppShell>
  );
}
