import { useEffect } from 'react';

type ScrollLockSnapshot = {
  scrollY: number;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyWidth: string;
  bodyLeft: string;
  bodyRight: string;
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
    snapshot = {
      scrollY: window.scrollY,
      bodyOverflow: bodyStyle.overflow,
      bodyPosition: bodyStyle.position,
      bodyTop: bodyStyle.top,
      bodyWidth: bodyStyle.width,
      bodyLeft: bodyStyle.left,
      bodyRight: bodyStyle.right,
      bodyTouchAction: bodyStyle.touchAction,
      htmlOverflow: htmlStyle.overflow,
      htmlOverscrollY: htmlStyle.overscrollBehaviorY,
    };

    bodyStyle.overflow = 'hidden';
    bodyStyle.position = 'fixed';
    bodyStyle.top = `-${window.scrollY}px`;
    bodyStyle.width = '100%';
    bodyStyle.left = '0';
    bodyStyle.right = '0';
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
  const restoreScroll = snapshot.bodyPosition !== 'fixed';

  bodyStyle.overflow = snapshot.bodyOverflow;
  bodyStyle.position = snapshot.bodyPosition;
  bodyStyle.top = snapshot.bodyTop;
  bodyStyle.width = snapshot.bodyWidth;
  bodyStyle.left = snapshot.bodyLeft;
  bodyStyle.right = snapshot.bodyRight;
  bodyStyle.touchAction = snapshot.bodyTouchAction;
  htmlStyle.overflow = snapshot.htmlOverflow;
  htmlStyle.overscrollBehaviorY = snapshot.htmlOverscrollY;

  if (restoreScroll) {
    window.scrollTo(0, snapshot.scrollY);
  }

  snapshot = null;
}

export function usePageScrollLock(active: boolean, lockId: string) {
  useEffect(() => {
    if (!active) return;
    lockPageScroll(lockId);
    return () => unlockPageScroll(lockId);
  }, [active, lockId]);
}
