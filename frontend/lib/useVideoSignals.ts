"use client";
import { useEffect, useRef } from "react";
import { api } from "@/lib/apiClient";
import { useSimulationStore } from "@/stores/simulationStore";

export function useVideoSignals(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  sessionId: string,
  enabled = true,
) {
  const store = useSimulationStore();
  const frameIndex = useRef(0);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(async () => {
      if (inFlightRef.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      if (video.videoWidth < 40 || video.videoHeight < 40) return;

      const canvas = document.createElement("canvas");
      canvas.width = Math.min(video.videoWidth || 640, 480);
      canvas.height = Math.min(video.videoHeight || 480, 360);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame_b64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

      try {
        inFlightRef.current = true;
        const resp = await api.analyzeFrame({
          frame_b64,
          session_id: sessionId,
          frame_index: frameIndex.current++,
        });
        store.setLiveSignals(resp.signals);
        store.pushSignalSnapshot(resp.signals);
      } catch {
        // network errors are non-fatal; keep polling
      } finally {
        inFlightRef.current = false;
      }
    }, 1200);

    return () => clearInterval(id);
  }, [videoRef, sessionId, store, enabled]);
}
