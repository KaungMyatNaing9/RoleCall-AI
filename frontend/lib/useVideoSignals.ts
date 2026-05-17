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

  useEffect(() => {
    if (!enabled) return;

    const id = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame_b64 = canvas.toDataURL("image/jpeg", 0.7).split(",")[1];

      try {
        const resp = await api.analyzeFrame({
          frame_b64,
          session_id: sessionId,
          frame_index: frameIndex.current++,
        });
        store.setLiveSignals(resp.signals);
        store.pushSignalSnapshot(resp.signals);
      } catch {
        // network errors are non-fatal; keep polling
      }
    }, 3000);

    return () => clearInterval(id);
  }, [videoRef, sessionId, store, enabled]);
}
