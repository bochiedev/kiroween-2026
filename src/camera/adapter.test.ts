import { describe, expect, it, vi } from 'vitest';
import { startCamera, type Detector } from './adapter';
import { CameraError, classifyCameraError, FAILURE_MESSAGES } from './errors';

const named = (name: string) => Object.assign(new Error(name), { name });
const options = { video: {} as HTMLVideoElement, onSignal: () => {} };

const failure = async (p: Promise<unknown>) => {
  try {
    await p;
  } catch (e) {
    return e instanceof CameraError ? e.kind : 'other';
  }
  return 'none';
};

describe('startCamera failures (R2)', () => {
  it('reports unsupported when mediaDevices is missing', async () => {
    expect(await failure(startCamera(options, { mediaDevices: undefined }))).toBe('unsupported');
  });

  it('reports unsupported when getUserMedia is not a function', async () => {
    const deps = { mediaDevices: {} as MediaDevices };
    expect(await failure(startCamera(options, deps))).toBe('unsupported');
  });

  it('reports denied for NotAllowedError', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(named('NotAllowedError'));
    expect(await failure(startCamera(options, { mediaDevices: { getUserMedia } }))).toBe('denied');
    expect(getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('reports no-device for NotFoundError', async () => {
    const getUserMedia = vi.fn().mockRejectedValue(named('NotFoundError'));
    expect(await failure(startCamera(options, { mediaDevices: { getUserMedia } }))).toBe('no-device');
  });

  it('stops every track when the detector fails to load', async () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }, { stop }] } as unknown as MediaStream;
    const deps = {
      mediaDevices: { getUserMedia: vi.fn().mockResolvedValue(stream) },
      loadDetector: (): Promise<Detector> => Promise.reject(new Error('chunk failed')),
    };
    expect(await failure(startCamera(options, deps))).toBe('error');
    expect(stop).toHaveBeenCalledTimes(2);
  });

  it('each failure kind has a distinct message', () => {
    const msgs = Object.values(FAILURE_MESSAGES);
    expect(new Set(msgs).size).toBe(msgs.length);
  });

  it('classifies browser error names', () => {
    expect(classifyCameraError(named('NotAllowedError'))).toBe('denied');
    expect(classifyCameraError(named('SecurityError'))).toBe('denied');
    expect(classifyCameraError(named('NotFoundError'))).toBe('no-device');
    expect(classifyCameraError(named('NotReadableError'))).toBe('error');
    expect(classifyCameraError(null)).toBe('error');
  });
});
