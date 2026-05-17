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
}

export function useBrowserSpeechRecognition({ onFinalTranscript }: SpeechRecognitionOptions) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalTranscriptRef = useRef("");
  const manualStopRef = useRef(false);

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsSupported(supportsBrowserDictation());
  }, []);

  const stopTracks = useCallback(() => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    manualStopRef.current = true;
    recognitionRef.current?.stop();
    stopTracks();
  }, [stopTracks]);

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
      };

      recognition.onerror = (event) => {
        if (event.error !== "aborted") {
          setErrorMessage(`Speech recognition failed: ${event.error}.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        stopTracks();
        const text = finalTranscriptRef.current.trim();
        setInterimTranscript(text);
        if (text) {
          onFinalTranscript(text);
          finalTranscriptRef.current = "";
        }
        manualStopRef.current = false;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (error) {
      stopTracks();
      setErrorMessage(error instanceof Error ? error.message : "Microphone access failed.");
    }
  }, [onFinalTranscript, stopTracks]);

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      stopTracks();
    },
    [stopTracks],
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
