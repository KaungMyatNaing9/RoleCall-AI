"use client";

/** Speak text in-browser when server TTS is unavailable (404 / no ElevenLabs). */
export function speakWithBrowserTts(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.95;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopBrowserTts() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
