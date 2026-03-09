import { afterEach, describe, expect, it } from 'vitest';
import { safeLocalStorageGet, safeLocalStorageSet } from './storage';

const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, 'window', {
    value: originalWindow,
    writable: true,
    configurable: true,
  });
});

describe('safeLocalStorageGet', () => {
  it('returns null when window is unavailable', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(safeLocalStorageGet('consent')).toBeNull();
  });

  it('returns storage value when access succeeds', () => {
    const localStorage = {
      getItem: (key: string) => (key === 'consent' ? '{"analytics":true}' : null),
      setItem: () => {},
    };

    Object.defineProperty(globalThis, 'window', {
      value: { localStorage },
      writable: true,
      configurable: true,
    });

    expect(safeLocalStorageGet('consent')).toBe('{"analytics":true}');
  });

  it('returns null when storage access throws', () => {
    const localStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {},
    };

    Object.defineProperty(globalThis, 'window', {
      value: { localStorage },
      writable: true,
      configurable: true,
    });

    expect(safeLocalStorageGet('consent')).toBeNull();
  });
});

describe('safeLocalStorageSet', () => {
  it('returns false when window is unavailable', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(safeLocalStorageSet('consent', '{"analytics":true}')).toBe(false);
  });

  it('returns true when storage write succeeds', () => {
    let stored = '';
    const localStorage = {
      getItem: () => null,
      setItem: (_key: string, value: string) => {
        stored = value;
      },
    };

    Object.defineProperty(globalThis, 'window', {
      value: { localStorage },
      writable: true,
      configurable: true,
    });

    expect(safeLocalStorageSet('consent', '{"analytics":true}')).toBe(true);
    expect(stored).toBe('{"analytics":true}');
  });

  it('returns false when storage write throws', () => {
    const localStorage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    Object.defineProperty(globalThis, 'window', {
      value: { localStorage },
      writable: true,
      configurable: true,
    });

    expect(safeLocalStorageSet('consent', '{"analytics":true}')).toBe(false);
  });
});
