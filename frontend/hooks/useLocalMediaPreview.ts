"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  attachStreamToVideo,
  cameraStreamRef,
  ensureLocalMedia,
  isMediaStreamLive,
} from "@/lib/cameraStream";

type PreviewStatus = "idle" | "loading" | "ready" | "error";

export function useLocalMediaPreview(needs: { video: boolean; audio: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<PreviewStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const bindVideo = useCallback(async (stream: MediaStream) => {
    const video = videoRef.current;
    if (!needs.video || !video) return;
    await attachStreamToVideo(video, stream);
  }, [needs.video]);

  useEffect(() => {
    if (!needs.video && !needs.audio) {
      setStatus("idle");
      setErrorMessage("");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setErrorMessage("");

    void ensureLocalMedia(needs)
      .then(async (stream) => {
        if (cancelled) return;
        await bindVideo(stream);
        if (cancelled) return;
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not access camera or microphone.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [bindVideo, needs.audio, needs.video]);

  // Re-bind when the video element mounts (ref attached after stream is ready).
  useEffect(() => {
    if (!needs.video || status !== "ready") return;
    const stream = cameraStreamRef.get();
    if (!isMediaStreamLive(stream)) return;
    void bindVideo(stream!);
  }, [bindVideo, needs.video, status]);

  return {
    videoRef,
    status,
    errorMessage,
    isReady: status === "ready",
  };
}

export function stopLocalMediaPreview() {
  cameraStreamRef.stop();
}
