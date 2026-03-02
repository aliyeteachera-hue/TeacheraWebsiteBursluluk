import { describe, expect, it } from 'vitest';
import { getOverlayLifecycleOptions } from './overlayLifecycle';

describe('overlay lifecycle options', () => {
  it('returns mobile-menu tuned timing for coarse pointer', () => {
    const options = getOverlayLifecycleOptions('mobile-menu', true, false);
    expect(options.motionProfile).toBe('balanced');
    expect(options.releaseAfterMs).toBe(0);
    expect(options.lockTouch).toBe(false);
  });

  it('keeps desktop overlays touch-unlocked but scroll-locked', () => {
    const options = getOverlayLifecycleOptions('free-trial', false, false);
    expect(options.motionProfile).toBe('full');
    expect(options.releaseAfterMs).toBe(260);
    expect(options.lockTouch).toBe(false);
  });

  it('caps release timing when lite mode is enabled', () => {
    const options = getOverlayLifecycleOptions('delivery-appointment', true, true);
    expect(options.motionProfile).toBe('lite');
    expect(options.releaseAfterMs).toBe(420);
  });
});
