import { useEffect, useState } from 'react';

const CONSTRAINED_NETWORK_TYPES = new Set(['slow-2g', '2g']);

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
};

function getNetworkInformation(): NetworkInformationLike | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as NavigatorWithNetwork;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
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
  return isConstrainedNetwork();
}

export function useLiteMode() {
  const [liteMode, setLiteMode] = useState(computeLiteMode);

  useEffect(() => {
    const network = getNetworkInformation();
    const updateAdaptiveLiteMode = () => {
      setLiteMode(isConstrainedNetwork());
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
