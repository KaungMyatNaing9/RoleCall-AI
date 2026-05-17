"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { useSimulationStore } from "@/stores/simulationStore";
import { stopLocalMediaPreview, useLocalMediaPreview } from "@/hooks/useLocalMediaPreview";
import { PRIVACY_NOTICE } from "@/lib/constants";

export default function SetupPage() {
  const router = useRouter();
  const joiningRef = useRef(false);
  const store = useSimulationStore();
  const setMediaPrecallReady = useSimulationStore((s) => s.setMediaPrecallReady);
  const mediaPrecallReady = useSimulationStore((s) => s.mediaPrecallReady);
  const personaName = store.persona?.name || "Your practice partner";
  const mode = store.mode || "video";
  const isVideoMode = mode === "video";
  const isVoiceMode = mode === "voice";
  const isPhoneMode = mode === "phone";
  const isTextMode = mode === "text";
  const needsMedia = isVideoMode || isVoiceMode || isPhoneMode;

  const preview = useLocalMediaPreview({
    video: isVideoMode,
    audio: needsMedia,
  });

  useEffect(() => {
    const ready = isTextMode || preview.isReady;
    if (mediaPrecallReady !== ready) {
      setMediaPrecallReady(ready);
    }
  }, [isTextMode, mediaPrecallReady, preview.isReady, setMediaPrecallReady]);

  useEffect(() => {
    return () => {
      if (!joiningRef.current) {
        stopLocalMediaPreview();
      }
    };
  }, []);

  const handleJoin = () => {
    joiningRef.current = true;
    setMediaPrecallReady(isTextMode || preview.isReady);
    router.push("/simulation/call");
  };

  const canJoin = isTextMode || preview.isReady;

  const joinLabel = isTextMode
    ? "Start chat"
    : isPhoneMode
      ? "Start call"
      : isVoiceMode
        ? "Start voice"
        : "Start video";

  const previewMessage =
    preview.status === "error"
      ? preview.errorMessage || "Allow camera and microphone access, then try again."
      : preview.status === "loading"
        ? isVideoMode
          ? "Opening camera and microphone…"
          : "Opening microphone…"
        : preview.status === "ready" && !isVideoMode
          ? "Microphone ready."
          : preview.status === "ready"
            ? "Camera and microphone ready."
            : isVideoMode
              ? "Allow camera access to continue."
              : needsMedia
                ? "Allow microphone access to continue."
                : "";

  if (!store.persona || !store.scenario || !store.rubric) {
    return (
      <AppShell>
        <TopNav active="Simulations" compact />
        <main style={{ flex: 1, display: "grid", placeItems: "center", padding: 28 }}>
          <div className="rc-glass" style={{ width: 560, maxWidth: "100%", padding: 28, textAlign: "center" }}>
            <h1 className="rc-h-2" style={{ margin: "0 0 10px" }}>No simulation ready</h1>
            <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 20 }}>Generate a simulation before starting a session.</p>
            <Link href="/create"><button className="rc-btn primary">Generate simulation</button></Link>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopNav active="New" compact />
      <main style={{ flex: 1, padding: "28px", maxWidth: 640, margin: "0 auto" }}>
        <h1 className="rc-h-2" style={{ margin: "0 0 8px" }}>Device check</h1>
        <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24 }}>
          Session with <strong style={{ color: "var(--ink-0)" }}>{personaName}</strong>
          {isTextMode ? " · text mode" : isPhoneMode ? " · audio only" : isVoiceMode ? " · voice" : " · video"}.
        </p>

        {isVideoMode && (
          <div
            className="rc-glass"
            style={{
              position: "relative",
              aspectRatio: "16/10",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 24,
              background: "#0F1424",
            }}
          >
            <video
              ref={preview.videoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scaleX(-1)",
                opacity: preview.isReady ? 1 : 0,
              }}
            />
            {!preview.isReady && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  color: preview.status === "error" ? "#FCA5A5" : "var(--ink-2)",
                  padding: 20,
                  textAlign: "center",
                }}
              >
                {previewMessage}
              </div>
            )}
          </div>
        )}

        {!isVideoMode && needsMedia && (
          <MicCheckPanel previewMessage={previewMessage} isReady={preview.isReady} hasError={preview.status === "error"} />
        )}

        <section className="rc-glass" style={{ padding: 18, marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: "0 0 14px" }}>
            Privacy
          </h2>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 16px" }}>
            {isTextMode ? "Text mode uses transcript coaching only." : PRIVACY_NOTICE}
          </p>
          {(
            [
              { key: "consentVideoSignals" as const, label: "Video signal analysis" },
              { key: "consentAudioSignals" as const, label: "Audio signal analysis" },
              { key: "consentSaveTranscript" as const, label: "Save transcript" },
            ] as const
          ).map(({ key, label }) => (
            <label
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 14,
                marginBottom: 10,
                opacity: (isPhoneMode || isTextMode) && key === "consentVideoSignals" ? 0.45 : 1,
              }}
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={store[key]}
                disabled={(isPhoneMode || isTextMode) && key === "consentVideoSignals"}
                onChange={(e) => store.setConsent(key, e.target.checked)}
              />
            </label>
          ))}
        </section>

        <button
          type="button"
          className="rc-btn accent lg"
          style={{ width: "100%", justifyContent: "center", opacity: canJoin ? 1 : 0.55 }}
          onClick={handleJoin}
          disabled={needsMedia && !canJoin}
        >
          {isTextMode ? <Icons.chat size={14} /> : isPhoneMode ? <Icons.phone size={14} /> : isVoiceMode ? <Icons.mic size={14} /> : <Icons.video size={14} />}{" "}
          {joinLabel}
        </button>
      </main>
    </AppShell>
  );
}

function MicCheckPanel({
  previewMessage,
  isReady,
  hasError,
}: {
  previewMessage: string;
  isReady: boolean;
  hasError: boolean;
}) {
  return (
    <div
      className="rc-glass"
      style={{
        padding: "16px 18px",
        marginBottom: 24,
        fontSize: 13,
        color: hasError ? "#FCA5A5" : "var(--ink-2)",
        lineHeight: 1.5,
        border: isReady ? "1px solid rgba(45,212,191,0.35)" : "1px solid var(--line)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icons.mic size={14} />
        <span style={{ fontWeight: 600, color: "var(--ink-0)" }}>Microphone check</span>
      </div>
      {previewMessage}
    </div>
  );
}
