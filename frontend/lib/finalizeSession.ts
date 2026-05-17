import { api, type AudioSignals, type VideoSignals } from "@/lib/apiClient";

export type SessionSignalsSummary = {
  video: VideoSignals | null;
  audio: AudioSignals | null;
};

export async function finalizeSessionSignals(opts: {
  sessionId: string;
  durationS: number;
  transcript: Array<{ speaker: string; text: string }>;
  consentVideo: boolean;
  consentAudio: boolean;
}): Promise<SessionSignalsSummary> {
  const userText = opts.transcript
    .filter((entry) => entry.speaker === "user")
    .map((entry) => entry.text)
    .join(" ");

  const [videoResult, audioResult] = await Promise.allSettled([
    opts.consentVideo
      ? api.summarizeVideoSession({ session_id: opts.sessionId })
      : Promise.resolve(null),
    opts.consentAudio
      ? api.summarizeAudioSession({
          session_id: opts.sessionId,
          duration_s: opts.durationS,
          transcript: userText,
        })
      : Promise.resolve(null),
  ]);

  return {
    video: videoResult.status === "fulfilled" ? videoResult.value : null,
    audio: audioResult.status === "fulfilled" ? audioResult.value : null,
  };
}
