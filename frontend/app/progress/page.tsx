"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";

export default function ProgressPage() {
  return (
    <AppShell>
      <TopNav active="Home" compact />
      <main style={{ flex: 1, padding: "32px 28px", maxWidth: 560 }}>
        <h1 className="rc-h-2" style={{ margin: "0 0 12px" }}>Progress</h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6, marginBottom: 24 }}>
          Long-term trends will appear here after you complete more sessions. For now, open your latest
          session report to see scores and coaching notes.
        </p>
        <Link href="/simulation/report">
          <button type="button" className="rc-btn primary">
            View latest report
          </button>
        </Link>
      </main>
    </AppShell>
  );
}
