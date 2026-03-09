import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  lockPageScroll,
  unlockPageScroll,
  unlockPageScrollDeferred,
} from './scrollLock';

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

function mockDom(isCoarsePointer = false) {
  const bodyStyle: Record<string, string> = {
    overflow: '',
    paddingRight: '4px',
    touchAction: '',
  };
  const htmlStyle: Record<string, string> = {
    overflow: '',
    overscrollBehaviorY: '',
  };

  const documentMock = {
    body: { style: bodyStyle },
    documentElement: {
      style: htmlStyle,
      clientWidth: 980,
    },
  } as unknown as Document;

  const windowMock = {
    innerWidth: 1000,
    matchMedia: () => ({ matches: isCoarsePointer }),
    getComputedStyle: () => ({ paddingRight: bodyStyle.paddingRight }),
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  } as unknown as Window;

  Object.defineProperty(globalThis, 'document', {
    value: documentMock,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'window', {
    value: windowMock,
    writable: true,
    configurable: true,
  });

  return { bodyStyle, htmlStyle };
}

describe('scrollLock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockDom();
  });

  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, 'document', {
      value: originalDocument,
      writable: true,
      configurable: true,
    });
  });

  it('locks and restores page styles for a single owner', () => {
    const { bodyStyle, htmlStyle } = mockDom();

    lockPageScroll('modal-a', false);
    expect(bodyStyle.overflow).toBe('hidden');
    expect(bodyStyle.paddingRight).toBe('24px');
    expect(bodyStyle.touchAction).toBe('');
    expect(htmlStyle.overflow).toBe('hidden');
    expect(htmlStyle.overscrollBehaviorY).toBe('none');

    unlockPageScroll('modal-a');
    expect(bodyStyle.overflow).toBe('');
    expect(bodyStyle.paddingRight).toBe('4px');
    expect(htmlStyle.overflow).toBe('');
    expect(htmlStyle.overscrollBehaviorY).toBe('');
  });

  it('keeps lock active until all owners are released', () => {
    const { bodyStyle } = mockDom();

    lockPageScroll('menu');
    lockPageScroll('trial-modal');
    unlockPageScroll('menu');
    expect(bodyStyle.overflow).toBe('hidden');

    unlockPageScroll('trial-modal');
    expect(bodyStyle.overflow).toBe('');
  });

  it('supports deferred unlock timing', () => {
    const { bodyStyle } = mockDom();

    lockPageScroll('deferred-modal');
    unlockPageScrollDeferred('deferred-modal', 180);

    vi.advanceTimersByTime(150);
    expect(bodyStyle.overflow).toBe('hidden');

    vi.advanceTimersByTime(40);
    expect(bodyStyle.overflow).toBe('');
  });

  it('keeps html overflow untouched on coarse pointer environments', () => {
    const { bodyStyle, htmlStyle } = mockDom(true);

    lockPageScroll('menu');
    expect(bodyStyle.overflow).toBe('hidden');
    expect(bodyStyle.touchAction).toBe('');
    expect(htmlStyle.overflow).toBe('');
    expect(htmlStyle.overscrollBehaviorY).toBe('');
  });
});
