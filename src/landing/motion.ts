export const TRANSITION_MS = 1200;

export interface ClickInfo {
  button: number;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}

/** True when the click is a plain primary click that the app should handle itself. */
export function isPlainClick(e: ClickInfo): boolean {
  return e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
}

/** The portal transition plays only for plain clicks when motion is allowed. */
export function shouldAnimate(reducedMotion: boolean, plain: boolean): boolean {
  return plain && !reducedMotion;
}
