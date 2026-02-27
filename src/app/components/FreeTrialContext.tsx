import { createContext, useContext, useState, type ReactNode } from 'react';
import { trackEvent } from '../lib/analytics';

interface FreeTrialContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const FreeTrialContext = createContext<FreeTrialContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function FreeTrialProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
    trackEvent('free_trial_open');
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
