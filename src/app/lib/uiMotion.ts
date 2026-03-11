import { useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import { useCoarsePointer } from './useCoarsePointer';
import { useLiteMode } from './useLiteMode';
import type { MotionProfile } from './overlayLifecycle';

type MotionTiming = {
  profile: MotionProfile;
  fast: number;
  base: number;
  slow: number;
  stagger: number;
  easeOut: [number, number, number, number];
};

function resolveMotionProfile(
  reduceMotion: boolean,
  isCoarsePointer: boolean,
  liteMode: boolean,
): MotionProfile {
  if (reduceMotion || liteMode) return 'lite';
  if (isCoarsePointer) return 'balanced';
  return 'full';
}

export function getMotionTiming(profile: MotionProfile): MotionTiming {
  if (profile === 'lite') {
    return {
      profile,
      fast: 0.16,
      base: 0.2,
      slow: 0.26,
      stagger: 0.03,
      easeOut: [0.33, 1, 0.68, 1],
    };
  }

  if (profile === 'balanced') {
    return {
      profile,
      fast: 0.2,
      base: 0.28,
      slow: 0.38,
      stagger: 0.045,
      easeOut: [0.25, 1, 0.5, 1],
    };
  }

  return {
    profile,
    fast: 0.24,
    base: 0.34,
    slow: 0.48,
    stagger: 0.06,
    easeOut: [0.22, 1, 0.36, 1],
  };
}

export function useMotionTiming() {
  const reduceMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const liteMode = useLiteMode();

  return useMemo(
    () => getMotionTiming(resolveMotionProfile(reduceMotion, isCoarsePointer, liteMode)),
    [reduceMotion, isCoarsePointer, liteMode],
  );
}
