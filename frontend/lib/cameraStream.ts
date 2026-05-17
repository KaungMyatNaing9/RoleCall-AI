let _stream: MediaStream | null = null;

export function isMediaStreamLive(stream: MediaStream | null): boolean {
  if (!stream) return false;
  return stream.getTracks().some((track) => track.readyState === "live");
}

export function streamMeetsNeeds(
  stream: MediaStream | null,
  needs: { video: boolean; audio: boolean },
): boolean {
  if (!isMediaStreamLive(stream)) return false;
  if (needs.video && !stream!.getVideoTracks().length) return false;
  if (needs.audio && !stream!.getAudioTracks().length) return false;
  return true;
}

export const cameraStreamRef = {
  get: () => _stream,
  set: (s: MediaStream | null) => {
    _stream = s;
  },
  stop: () => {
    _stream?.getTracks().forEach((t) => t.stop());
    _stream = null;
  },
};

export async function ensureLocalMedia(needs: {
  video: boolean;
  audio: boolean;
}): Promise<MediaStream> {
  if (streamMeetsNeeds(_stream, needs)) {
    return _stream!;
  }

  cameraStreamRef.stop();

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera and microphone are not available on this page.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: needs.video,
    audio: needs.audio,
  });

  cameraStreamRef.set(stream);
  return stream;
}

export async function attachStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  if (video.srcObject !== stream) {
    video.srcObject = stream;
  }
  video.muted = true;
  video.playsInline = true;
  try {
    await video.play();
  } catch {
    // Ignore autoplay rejection; a later user gesture may start playback.
  }
}

export function setVideoTrackEnabled(enabled: boolean): void {
  _stream?.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
}
