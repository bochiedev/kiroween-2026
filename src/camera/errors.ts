export type CameraFailure = 'unsupported' | 'denied' | 'no-device' | 'error';

export class CameraError extends Error {
  readonly kind: CameraFailure;
  constructor(kind: CameraFailure, message: string) {
    super(message);
    this.kind = kind;
  }
}

/** Maps a getUserMedia rejection to one of the failure kinds. */
export function classifyCameraError(err: unknown): CameraFailure {
  const name = typeof err === 'object' && err !== null && 'name' in err ? String((err as { name: unknown }).name) : '';
  if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') return 'no-device';
  return 'error';
}

export const FAILURE_MESSAGES: Record<CameraFailure, string> = {
  unsupported: 'This browser cannot use a camera here (it needs a secure https page and getUserMedia support).',
  denied: 'Camera permission was denied. Allow it in the browser site settings and try again.',
  'no-device': 'No camera was found on this device.',
  error: 'The camera could not be started.',
};
