import { useEffect, useLayoutEffect } from 'react';

type ScrollLockSnapshot = {
  bodyOverflow: string;
  bodyPaddingRight: string;
  bodyTouchAction: string;
  htmlOverflow: string;
  htmlOverscrollY: string;
};

const activeLocks = new Set<string>();
const pendingUnlockTimers = new Map<string, number>();
let snapshot: ScrollLockSnapshot | null = null;

function hasDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function lockPageScroll(lockId: string) {
  if (!hasDom() || activeLocks.has(lockId)) return;
  const pendingTimer = pendingUnlockTimers.get(lockId);
  if (pendingTimer !== undefined) {
    window.clearTimeout(pendingTimer);
    pendingUnlockTimers.delete(lockId);
  }

  const bodyStyle = document.body.style;
  const htmlStyle = document.documentElement.style;
  const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;

  if (activeLocks.size === 0) {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    snapshot = {
      bodyOverflow: bodyStyle.overflow,
      bodyPaddingRight: bodyStyle.paddingRight,
      bodyTouchAction: bodyStyle.touchAction,
      htmlOverflow: htmlStyle.overflow,
      htmlOverscrollY: htmlStyle.overscrollBehaviorY,
    };

    bodyStyle.overflow = 'hidden';
    if (!isCoarsePointer && scrollBarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight || '0') || 0;
      bodyStyle.paddingRight = `${currentPadding + scrollBarWidth}px`;
    }
    // Mobile'de touchAction/html overflow kilidi ani repaint/flicker yaratabildiği için
    // kilidi minimumda tutuyoruz. Desktop'ta mevcut davranışı koruyoruz.
    if (!isCoarsePointer) {
      bodyStyle.touchAction = 'none';
      htmlStyle.overflow = 'hidden';
      htmlStyle.overscrollBehaviorY = 'none';
    }
  }

  activeLocks.add(lockId);
}

export function unlockPageScroll(lockId: string) {
  if (!hasDom() || !activeLocks.has(lockId)) return;

  activeLocks.delete(lockId);
  if (activeLocks.size > 0 || !snapshot) return;

  const bodyStyle = document.body.style;
  const htmlStyle = document.documentElement.style;

  bodyStyle.overflow = snapshot.bodyOverflow;
  bodyStyle.paddingRight = snapshot.bodyPaddingRight;
  bodyStyle.touchAction = snapshot.bodyTouchAction;
  htmlStyle.overflow = snapshot.htmlOverflow;
  htmlStyle.overscrollBehaviorY = snapshot.htmlOverscrollY;

  snapshot = null;
}

export function unlockPageScrollDeferred(lockId: string, delayMs: number) {
  if (!hasDom()) return;

  const pendingTimer = pendingUnlockTimers.get(lockId);
  if (pendingTimer !== undefined) {
    window.clearTimeout(pendingTimer);
    pendingUnlockTimers.delete(lockId);
  }

  if (!activeLocks.has(lockId)) return;

  if (delayMs <= 0) {
    unlockPageScroll(lockId);
    return;
  }

  const timer = window.setTimeout(() => {
    pendingUnlockTimers.delete(lockId);
    unlockPageScroll(lockId);
  }, delayMs);

  pendingUnlockTimers.set(lockId, timer);
}

export function usePageScrollLock(active: boolean, lockId: string, releaseDelayMs?: number) {
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    if (!active) return;
    const isCoarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const releaseDelay = releaseDelayMs ?? (isCoarsePointer ? 240 : 0);
    lockPageScroll(lockId);
    return () => unlockPageScrollDeferred(lockId, releaseDelay);
  }, [active, lockId, releaseDelayMs]);
}
