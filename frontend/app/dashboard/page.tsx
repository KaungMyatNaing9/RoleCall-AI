"use client";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";

const QUICK_START = [
  { n: "Healthcare", href: "/create" },
  { n: "Customer service", href: "/create" },
  { n: "Sales", href: "/create" },
  { n: "Interview", href: "/create" },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <TopNav active="Home" />
      <main style={{ flex: 1, padding: "32px 28px", maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
          <h1 className="rc-h-2" style={{ margin: 0 }}>Simulations</h1>
          <Link href="/create">
            <button className="rc-btn primary"><Icons.sparkle size={14} /> New simulation</button>
          </Link>
        </div>

        <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24, lineHeight: 1.5 }}>
          Start with a template or describe your own persona on the next screen.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {QUICK_START.map((x) => (
            <Link key={x.n} href={x.href} style={{ textDecoration: "none" }}>
              <article className="rc-glass" style={{ padding: "16px 18px", cursor: "pointer" }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{x.n}</span>
              </article>
            </Link>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 13, color: "var(--ink-3)" }}>
          After a session, your latest report appears under{" "}
          <Link href="/simulation/report" style={{ color: "var(--ink-1)" }}>Report</Link>.
        </p>
      </main>
    </AppShell>
  );
}
