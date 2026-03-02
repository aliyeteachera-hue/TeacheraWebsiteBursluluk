import { useMemo } from 'react';
import { useCoarsePointer } from './useCoarsePointer';
import { useLiteMode } from './useLiteMode';
import { usePageScrollLock } from './scrollLock';

export type MotionProfile = 'full' | 'balanced' | 'lite';

export type OverlayOwner =
  | 'mobile-menu'
  | 'free-trial'
  | 'level-assessment'
  | 'delivery-appointment'
  | 'speakup-form'
  | 'speakup-video';

export interface OverlayLifecycleOptions {
  releaseAfterMs: number;
  lockTouch: boolean;
  motionProfile: MotionProfile;
}

function resolveMotionProfile(isCoarsePointer: boolean, prefersLiteMotion: boolean): MotionProfile {
  if (prefersLiteMotion) return 'lite';
  if (isCoarsePointer) return 'balanced';
  return 'full';
}

export function getOverlayLifecycleOptions(
  owner: OverlayOwner,
  isCoarsePointer: boolean,
  prefersLiteMotion: boolean,
): OverlayLifecycleOptions {
  const motionProfile = resolveMotionProfile(isCoarsePointer, prefersLiteMotion);

  let releaseAfterMs = isCoarsePointer ? 240 : 150;
  // Mobile menu uses AnimatePresence mount/unmount lifecycle, so no extra defer is needed.
  if (owner === 'mobile-menu') releaseAfterMs = 0;
  if (
    owner === 'free-trial' ||
    owner === 'level-assessment' ||
    owner === 'delivery-appointment' ||
    owner === 'speakup-form'
  ) {
    releaseAfterMs = isCoarsePointer ? 420 : 260;
  }
  if (owner === 'speakup-video') releaseAfterMs = isCoarsePointer ? 120 : 100;
  if (!isCoarsePointer && motionProfile === 'lite') releaseAfterMs = Math.min(releaseAfterMs, 90);

  return {
    releaseAfterMs,
    lockTouch: owner === 'mobile-menu' ? false : isCoarsePointer,
    motionProfile,
  };
}

export function useOverlayLifecycle(active: boolean, owner: OverlayOwner) {
  const isCoarsePointer = useCoarsePointer();
  const prefersLiteMotion = useLiteMode();

  const options = useMemo(
    () => getOverlayLifecycleOptions(owner, isCoarsePointer, prefersLiteMotion),
    [owner, isCoarsePointer, prefersLiteMotion],
  );

  usePageScrollLock(active, owner, options.releaseAfterMs, options.lockTouch);
  return options;
}
