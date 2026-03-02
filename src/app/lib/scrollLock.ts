import { useEffect } from 'react';

type ScrollLockSnapshot = {
  bodyOverflow: string;
  bodyPaddingRight: string;
  bodyTouchAction: string;
  htmlOverflow: string;
  htmlOverscrollY: string;
};

const activeLocks = new Set<string>();
let snapshot: ScrollLockSnapshot | null = null;

function hasDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function lockPageScroll(lockId: string) {
  if (!hasDom() || activeLocks.has(lockId)) return;

  const bodyStyle = document.body.style;
  const htmlStyle = document.documentElement.style;

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
    if (scrollBarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight || '0') || 0;
      bodyStyle.paddingRight = `${currentPadding + scrollBarWidth}px`;
    }
    bodyStyle.touchAction = 'none';
    htmlStyle.overflow = 'hidden';
    htmlStyle.overscrollBehaviorY = 'none';
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

export function usePageScrollLock(active: boolean, lockId: string) {
  useEffect(() => {
    if (!active) return;
    lockPageScroll(lockId);
    return () => unlockPageScroll(lockId);
  }, [active, lockId]);
}
