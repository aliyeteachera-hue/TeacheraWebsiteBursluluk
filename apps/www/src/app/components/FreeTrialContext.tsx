import { createContext, useContext, useState, type ReactNode } from 'react';
import { trackEvent } from '../lib/analytics';

interface FreeTrialContextType {
  isOpen: boolean;
  open: (source?: string) => void;
  close: () => void;
}

const FreeTrialContext = createContext<FreeTrialContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function FreeTrialProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = (source = 'unknown') => {
    setIsOpen(true);
    trackEvent('free_trial_open', { source });
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <FreeTrialContext.Provider
      value={{
        isOpen,
        open,
        close,
      }}
    >
      {children}
    </FreeTrialContext.Provider>
  );
}

export function useFreeTrial() {
  return useContext(FreeTrialContext);
}
