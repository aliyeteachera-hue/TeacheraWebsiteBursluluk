import { useEffect, useState } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 767px)';
const LOW_CORE_THRESHOLD = 4;

function isLowCoreDevice() {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.hardwareConcurrency === 'number'
    ? navigator.hardwareConcurrency <= LOW_CORE_THRESHOLD
    : false;
}

function computeLiteMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches || isLowCoreDevice();
}

export function useLiteMode() {
  const [liteMode, setLiteMode] = useState(computeLiteMode);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateLiteMode = () => setLiteMode(mediaQuery.matches || isLowCoreDevice());

    updateLiteMode();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateLiteMode);
      return () => mediaQuery.removeEventListener('change', updateLiteMode);
    }

    mediaQuery.addListener(updateLiteMode);
    return () => mediaQuery.removeListener(updateLiteMode);
  }, []);

  return liteMode;
}
