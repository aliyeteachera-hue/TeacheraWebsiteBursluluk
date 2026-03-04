import { useEffect, useRef, type PointerEventHandler, type ReactNode, type RefObject } from 'react';
import { useOverlayLifecycle, type OverlayOwner } from '../../lib/overlayLifecycle';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isElementVisible(node: HTMLElement) {
  if (node.getAttribute('aria-hidden') === 'true') return false;
  if (node.tabIndex < 0) return false;
  return node.getClientRects().length > 0;
}

function getFocusableElements(container: HTMLElement) {
  const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return nodes.filter(isElementVisible);
}

const activeOverlayStack: string[] = [];
let overlayIdCounter = 0;

function pushOverlay(overlayId: string) {
  const existingIndex = activeOverlayStack.indexOf(overlayId);
  if (existingIndex >= 0) {
    activeOverlayStack.splice(existingIndex, 1);
  }
  activeOverlayStack.push(overlayId);
}

function removeOverlay(overlayId: string) {
  const existingIndex = activeOverlayStack.indexOf(overlayId);
  if (existingIndex >= 0) {
    activeOverlayStack.splice(existingIndex, 1);
  }
}

function isTopOverlay(overlayId: string) {
  return activeOverlayStack.length > 0 && activeOverlayStack[activeOverlayStack.length - 1] === overlayId;
}

export interface OverlayRenderProps {
  panelRef: RefObject<HTMLDivElement | null>;
  panelProps: {
    ref: RefObject<HTMLDivElement | null>;
    role: 'dialog';
    'aria-modal': true;
    'aria-label': string;
    tabIndex: -1;
    className?: string;
    onPointerDown: PointerEventHandler<HTMLDivElement>;
  };
}

interface OverlayBaseProps {
  open: boolean;
  onClose: () => void;
  owner: OverlayOwner;
  ariaLabel: string;
  containerClassName?: string;
  panelClassName?: string;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  restoreFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode | ((props: OverlayRenderProps) => ReactNode);
}

function OverlayBase({
  open,
  onClose,
  owner,
  ariaLabel,
  containerClassName,
  panelClassName,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  restoreFocus = true,
  initialFocusRef,
  children,
}: OverlayBaseProps) {
  const overlayIdRef = useRef<string>(`overlay-${++overlayIdCounter}`);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useOverlayLifecycle(open, owner);

  useEffect(() => {
    if (!open) return;
    const overlayId = overlayIdRef.current;
    pushOverlay(overlayId);
    return () => {
      removeOverlay(overlayId);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const overlayId = overlayIdRef.current;

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusTimer = window.setTimeout(() => {
      if (!isTopOverlay(overlayId)) return;
      const root = rootRef.current;
      const panel = panelRef.current;
      if (!root || !panel) return;

      const initialFocusNode = initialFocusRef?.current;
      if (initialFocusNode && root.contains(initialFocusNode) && isElementVisible(initialFocusNode)) {
        initialFocusNode.focus();
        return;
      }

      const focusableElements = getFocusableElements(root);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        return;
      }

      panel.focus();
    }, 0);

    const onKeyboardControl = (event: KeyboardEvent) => {
      if (!isTopOverlay(overlayId)) return;

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const root = rootRef.current;
      const panel = panelRef.current;
      if (!root || !panel) return;

      const focusableElements = getFocusableElements(root);
      if (focusableElements.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;
      const focusInsideOverlay = activeElement ? root.contains(activeElement) : false;

      if (event.shiftKey) {
        if (!focusInsideOverlay || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!focusInsideOverlay || activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', onKeyboardControl);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyboardControl);

      if (!restoreFocus) return;

      const previousElement = previousActiveElementRef.current;
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
      }
      previousActiveElementRef.current = null;
    };
  }, [open, onClose, closeOnEscape, restoreFocus, initialFocusRef]);

  if (!open) return null;

  const onOutsidePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isTopOverlay(overlayIdRef.current)) return;
    if (!closeOnOutsideClick) return;
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  const panelProps: OverlayRenderProps['panelProps'] = {
    ref: panelRef,
    role: 'dialog',
    'aria-modal': true,
    'aria-label': ariaLabel,
    tabIndex: -1,
    className: panelClassName,
    onPointerDown: (event) => event.stopPropagation(),
  };

  return (
    <div ref={rootRef} className={containerClassName} onPointerDown={onOutsidePointerDown}>
      {typeof children === 'function' ? children({ panelRef, panelProps }) : <div {...panelProps}>{children}</div>}
    </div>
  );
}

export interface OverlayModalProps extends OverlayBaseProps {}

export function OverlayModal(props: OverlayModalProps) {
  return <OverlayBase {...props} />;
}

export interface OverlayDrawerProps extends OverlayBaseProps {}

export function OverlayDrawer(props: OverlayDrawerProps) {
  return <OverlayBase {...props} />;
}
