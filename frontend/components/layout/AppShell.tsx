"use client";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
  noShell?: boolean;
}

export function AppShell({ children, className, noShell = false }: AppShellProps) {
  return (
    <div className={cn("rc-root relative min-h-screen flex flex-col", className)}>
      {!noShell && <div className="rc-shell" />}
      {!noShell && <div className="rc-grain" />}
      <div className="relative z-10 flex flex-col flex-1">{children}</div>
    </div>
  );
}
