"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supportsBrowserDictation } from "@/lib/browserCapabilities";
import { cameraStreamRef, isMediaStreamLive } from "@/lib/cameraStream";

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognitionInstance;
  }

  interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEventLike) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionAlternativeLike {
    transcript: string;
  }

  interface SpeechRecognitionResultLike {
    isFinal: boolean;
    0: SpeechRecognitionAlternativeLike;
  }

  interface SpeechRecognitionEventLike {
    resultIndex: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
  }

  interface SpeechRecognitionErrorEventLike {
    error: string;
  }
}

interface SpeechRecognitionOptions {
  onFinalTranscript: (text: string) => void;
  /** Milliseconds of silence after speech before auto-submitting. 0 = disabled. */
  silenceTimeoutMs?: number;
}

export function useBrowserSpeechRecognition({
  onFinalTranscript,
  silenceTimeoutMs = 0,
}: SpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalTranscriptRef = useRef("");
  const manualStopRef = useRef(false);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef(false);

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsSupported(supportsBrowserDictation());
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const stopTracks = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    manualStopRef.current = true;
    recognitionRef.current?.stop();
    stopTracks();
  }, [clearSilenceTimer, stopTracks]);

  const startListening = useCallback(async () => {
    if (!supportsBrowserDictation()) {
      setErrorMessage("Voice dictation is not available here. Type your message instead.");
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setErrorMessage("Voice dictation is not available here. Type your message instead.");
      return;
    }

    try {
      setErrorMessage("");
      manualStopRef.current = false;
      hasSpokenRef.current = false;
      finalTranscriptRef.current = "";
      setInterimTranscript("");

      const shared = cameraStreamRef.get();
      const hasSharedMic =
        isMediaStreamLive(shared) && Boolean(shared?.getAudioTracks().length);

      if (!hasSharedMic) {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const transcript = result[0]?.transcript?.trim() || "";
          if (!transcript) continue;
          if (result.isFinal) {
            finalText += `${transcript} `;
          } else {
            interimText += `${transcript} `;
          }
        }

        if (finalText) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`.trim();
        }
        setInterimTranscript(`${finalTranscriptRef.current} ${interimText}`.trim());

        // Track that the user has spoken and reset the silence timer
        const hasContent = Boolean(finalTranscriptRef.current || interimText);
        if (hasContent) {
          hasSpokenRef.current = true;
          if (silenceTimeoutMs > 0) {
            clearSilenceTimer();
            silenceTimerRef.current = setTimeout(() => {
              // Calling stop() lets the browser finalize interim speech,
              // then fires onend → onFinalTranscript as normal.
              recognitionRef.current?.stop();
            }, silenceTimeoutMs);
          }
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== "aborted") {
          setErrorMessage(`Speech recognition failed: ${event.error}.`);
        }
      };

      recognition.onend = () => {
        clearSilenceTimer();
        setIsListening(false);
        stopTracks();
        const text = finalTranscriptRef.current.trim();
        setInterimTranscript(text);
        if (text) {
          onFinalTranscript(text);
          finalTranscriptRef.current = "";
        }
        manualStopRef.current = false;
        hasSpokenRef.current = false;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (error) {
      stopTracks();
      setErrorMessage(error instanceof Error ? error.message : "Microphone access failed.");
    }
  }, [clearSilenceTimer, onFinalTranscript, silenceTimeoutMs, stopTracks]);

  useEffect(
    () => () => {
      clearSilenceTimer();
      recognitionRef.current?.stop();
      stopTracks();
    },
    [clearSilenceTimer, stopTracks],
  );

  const clearTranscript = useCallback(() => setInterimTranscript(""), []);

  return {
    isSupported,
    isListening,
    interimTranscript,
    errorMessage,
    startListening,
    stopListening,
    clearTranscript,
  };
}
