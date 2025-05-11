import { createContext, useCallback, useContext, useState } from 'react';

interface StepContextProps {
  stepIndex: number;
  direction: 'forward' | 'backward';
  next: () => void;
  prev: () => void;
}

const StepContext = createContext<StepContextProps | null>(null);

export const StepProvider = ({ children }: { children: React.ReactNode }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const totalSteps = 3;

  const next = useCallback(() => {
    setDirection('forward');
    setStepIndex((prev) => (prev < totalSteps - 1 ? prev + 1 : prev));
  }, []);

  const prev = useCallback(() => {
    setDirection('backward');
    setStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  return <StepContext.Provider value={{ stepIndex, direction, next, prev }}>{children}</StepContext.Provider>;
};

export const useStep = () => {
  const context = useContext(StepContext);
  if (!context) throw new Error('useStep must be used within StepProvider');
  return context;
};
