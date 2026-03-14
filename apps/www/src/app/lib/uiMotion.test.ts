import { describe, expect, it } from 'vitest';
import { getMotionTiming } from './uiMotion';

describe('ui motion timing', () => {
  it('returns the fastest timings for lite profile', () => {
    const timing = getMotionTiming('lite');
    expect(timing.fast).toBeLessThan(timing.base);
    expect(timing.base).toBeLessThan(timing.slow);
    expect(timing.stagger).toBe(0.03);
  });

  it('keeps full profile slower and more expressive than balanced', () => {
    const full = getMotionTiming('full');
    const balanced = getMotionTiming('balanced');
    expect(full.base).toBeGreaterThan(balanced.base);
    expect(full.stagger).toBeGreaterThan(balanced.stagger);
  });
});
