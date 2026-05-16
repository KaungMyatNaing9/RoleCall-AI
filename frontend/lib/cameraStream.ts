let _stream: MediaStream | null = null;

export const cameraStreamRef = {
  get: () => _stream,
  set: (s: MediaStream | null) => { _stream = s; },
  stop: () => {
    _stream?.getTracks().forEach(t => t.stop());
    _stream = null;
  },
};
