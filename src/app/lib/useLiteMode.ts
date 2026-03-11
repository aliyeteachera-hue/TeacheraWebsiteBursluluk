import { useEffect, useState } from 'react';

const LOW_CORE_THRESHOLD = 4;
const LOW_MEMORY_THRESHOLD_GB = 4;
const CONSTRAINED_NETWORK_TYPES = new Set(['slow-2g', '2g', '3g']);

interface NetworkInformationLike {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
}

type NavigatorWithNetwork = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
  deviceMemory?: number;
};

function getNetworkInformation(): NetworkInformationLike | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as NavigatorWithNetwork;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function isLowCoreDevice() {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.hardwareConcurrency === 'number'
    ? navigator.hardwareConcurrency <= LOW_CORE_THRESHOLD
    : false;
}

function isLowMemoryDevice() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as NavigatorWithNetwork;
  return typeof nav.deviceMemory === 'number'
    ? nav.deviceMemory <= LOW_MEMORY_THRESHOLD_GB
    : false;
}

function isConstrainedNetwork() {
  const network = getNetworkInformation();
  if (!network) return false;

  if (network.saveData) return true;
  return typeof network.effectiveType === 'string'
    ? CONSTRAINED_NETWORK_TYPES.has(network.effectiveType)
    : false;
}

function computeLiteMode() {
  if (typeof window === 'undefined') return false;
  return (
    isLowCoreDevice() ||
    isLowMemoryDevice() ||
    isConstrainedNetwork()
  );
}

export function useLiteMode() {
  const [liteMode, setLiteMode] = useState(computeLiteMode);

  useEffect(() => {
    const network = getNetworkInformation();
    const updateAdaptiveLiteMode = () => {
      setLiteMode(
        isLowCoreDevice() ||
          isLowMemoryDevice() ||
          isConstrainedNetwork(),
      );
    };

    updateAdaptiveLiteMode();
    if (network && typeof network.addEventListener === 'function') {
      network.addEventListener('change', updateAdaptiveLiteMode);
    }

    return () => {
      if (network && typeof network.removeEventListener === 'function') {
        network.removeEventListener('change', updateAdaptiveLiteMode);
      }
    };
  }, []);

  return liteMode;
}
