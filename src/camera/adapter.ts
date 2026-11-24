// Camera adapter. Emits presence signals only. It must not import the simulation.
import { CameraError, classifyCameraError } from './errors';
import { createDebouncer, type DebouncerOptions, type Signal } from './presence';

export interface Detection {
  id: number;
}

/** Anything that turns a frame into detected marker ids. Lets tests and other libraries plug in. */
export interface Detector {
  detect(frame: ImageData): Detection[];
}

export interface CameraDeps {
  mediaDevices?: Pick<MediaDevices, 'getUserMedia'>;
  /** Defaults to a lazy `import('js-aruco2')`. */
  loadDetector?: () => Promise<Detector>;
}

export interface CameraSession {
  stream: MediaStream;
  stop(): void;
}

export interface StartOptions {
  video: HTMLVideoElement;
  onSignal: (signal: Signal) => void;
  debounce?: DebouncerOptions;
}

async function loadArucoDetector(): Promise<Detector> {
  // Dynamic import keeps the detection library out of every chunk except this one.
  // The package is CommonJS and sets `AR` on its exports (or on default, depending on the bundler).
  const mod = (await import('js-aruco2')) as { AR?: ArModule; default?: { AR?: ArModule } };
  const AR = mod.AR ?? mod.default?.AR;
  if (!AR) throw new CameraError('error', 'The marker detection library did not load.');
  return new AR.Detector({ dictionaryName: 'ARUCO' });
}

interface ArModule {
  Detector: new (config: { dictionaryName: string }) => Detector;
}

/**
 * Asks for the camera. Call only from a user click. Frames stay in memory, are never stored
 * or sent anywhere, and stop() stops every track.
 */
export async function startCamera(options: StartOptions, deps: CameraDeps = {}): Promise<CameraSession> {
  const media = deps.mediaDevices ?? (typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined);
  if (!media || typeof media.getUserMedia !== 'function') {
    throw new CameraError('unsupported', 'getUserMedia is not available');
  }

  let stream: MediaStream;
  try {
    stream = await media.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
  } catch (err) {
    throw new CameraError(classifyCameraError(err), err instanceof Error ? err.message : 'getUserMedia failed');
  }
  const stopTracks = () => stream.getTracks().forEach((t) => t.stop());

  let detector: Detector;
  try {
    detector = await (deps.loadDetector ?? loadArucoDetector)();
  } catch (err) {
    stopTracks();
    throw err instanceof CameraError ? err : new CameraError('error', 'The marker detection library did not load.');
  }

  const { video, onSignal } = options;
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  try {
    await video.play();
  } catch {
    stopTracks();
    throw new CameraError('error', 'The video preview could not start.');
  }

  const debouncer = createDebouncer(options.debounce);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let raf = 0;
  let stopped = false;

  const loop = () => {
    if (stopped) return;
    if (ctx && video.videoWidth > 0) {
      const w = 320;
      const h = Math.round((video.videoHeight / video.videoWidth) * w);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      const ids = detector.detect(ctx.getImageData(0, 0, w, h)).map((d) => d.id);
      for (const signal of debouncer.push(ids)) onSignal(signal);
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return {
    stream,
    stop() {
      stopped = true;
      cancelAnimationFrame(raf);
      stopTracks();
      video.srcObject = null;
    },
  };
}
