"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNav } from "@/components/layout/TopNav";
import { Icons } from "@/components/icons";
import { useSimulationStore } from "@/stores/simulationStore";
import { cameraStreamRef } from "@/lib/cameraStream";
import { PRIVACY_NOTICE } from "@/lib/constants";

export default function SetupPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camOk, setCamOk] = useState(false);
  const [camError, setCamError] = useState(false);
  const store = useSimulationStore();
  const personaName = store.persona?.name || "Your practice partner";
  const mode = store.mode || "video";
  const isVideoMode = mode === "video";
  const isVoiceMode = mode === "voice";
  const isPhoneMode = mode === "phone";
  const isTextMode = mode === "text";

  useEffect(() => {
    if (!isVideoMode && !isVoiceMode) {
      setCamOk(false);
      setCamError(false);
      return;
    }
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({
        video: isVideoMode ? { width: 1280, height: 720, facingMode: "user" } : false,
        audio: true,
      })
      .then((s) => {
        stream = s;
        cameraStreamRef.set(s);
        if (videoRef.current) videoRef.current.srcObject = s;
        setCamOk(true);
      })
      .catch(() => setCamError(true));

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isVideoMode, isVoiceMode]);

  const handleJoin = () => {
    store.startCall();
    router.push("/simulation/call");
  };

  const joinLabel = isTextMode
    ? "Start chat"
    : isPhoneMode
      ? "Start call"
      : isVoiceMode
        ? "Start voice"
        : "Start video";

  return (
    <AppShell>
      <TopNav active="New" compact />
      <main style={{ flex: 1, padding: "28px", maxWidth: 640, margin: "0 auto" }}>
        <h1 className="rc-h-2" style={{ margin: "0 0 8px" }}>Before you start</h1>
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
            {camOk ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 13,
                  color: "var(--ink-2)",
                  padding: 20,
                  textAlign: "center",
                }}
              >
                {camError
                  ? "Allow camera access in your browser, then refresh."
                  : "Checking camera…"}
              </div>
            )}
          </div>
        )}

        {(isVoiceMode || isPhoneMode) && (
          <p style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 24, lineHeight: 1.5 }}>
            Microphone will be used during the session. Video is off.
          </p>
        )}

        <section className="rc-glass" style={{ padding: 18, marginBottom: 24 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", margin: "0 0 14px" }}>
            Privacy
          </h2>
          <p style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.55, margin: "0 0 16px" }}>
            {isTextMode
              ? "Text mode uses transcript coaching only."
              : PRIVACY_NOTICE}
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

        <button type="button" className="rc-btn accent lg" style={{ width: "100%", justifyContent: "center" }} onClick={handleJoin}>
          {isTextMode ? <Icons.chat size={14} /> : <Icons.video size={14} />} {joinLabel}
        </button>
      </main>
    </AppShell>
  );
}
