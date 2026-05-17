export function hasWebSpeechRecognition(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/** Web Speech API dictation (not available in all browsers). */
export function supportsBrowserDictation(): boolean {
  if (!hasWebSpeechRecognition()) return false;
  if (typeof navigator === "undefined") return false;
  return !/firefox/i.test(navigator.userAgent);
}
