import { createContext, useContext, useState, type ReactNode } from 'react';
import { trackEvent } from '../lib/analytics';

interface LevelAssessmentContextType {
  isOpen: boolean;
  open: (source?: string) => void;
  close: () => void;
}

const LevelAssessmentContext = createContext<LevelAssessmentContextType>({
  isOpen: false,
  open: () => {},
  close: () => {},
});

export function LevelAssessmentProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = (source = 'unknown') => {
    setIsOpen(true);
    trackEvent('level_assessment_open', { source });
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <LevelAssessmentContext.Provider
      value={{
        isOpen,
        open,
        close,
      }}
    >
      {children}
    </LevelAssessmentContext.Provider>
  );
}

export function useLevelAssessment() {
  return useContext(LevelAssessmentContext);
}
