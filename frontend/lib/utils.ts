import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function timestampToMs(ts: string): number {
  const parts = ts.split(":");
  if (parts.length !== 2) return 0;
  return (parseInt(parts[0]) * 60 + parseInt(parts[1])) * 1000;
}

export function scoreToTone(score: number): "ok" | "warn" | "bad" {
  if (score >= 80) return "ok";
  if (score >= 65) return "warn";
  return "bad";
}
