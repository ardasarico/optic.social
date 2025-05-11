import Link from 'next/link';

import { AnimatePresence, motion } from 'motion/react';
import { StepProvider, useStep } from './StepContext';

import Step1 from './steps/Select';
import Step2 from './steps/Customize';
import Step3 from './steps/Start';

const steps = [Step1, Step2, Step3];

const variants = {
  enter: (direction: string) => ({
    x: direction === 'forward' ? 120 : -120,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: string) => ({
    x: direction === 'forward' ? -120 : 120,
    opacity: 0,
  }),
};

function StepsRenderer() {
  const { stepIndex, direction } = useStep();
  const StepComponent = steps[stepIndex];

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          className={'w-[384px] overflow-visible h-fit flex flex-col items-center justify-center gap-6'}
          key={stepIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: 'easeOut' }}>
          <StepComponent />
        </motion.div>
      </AnimatePresence>
      <div className={'absolute bottom-[24px] text-neutral-600 text-[13px] leading-[16px] flex items-center gap-2'}>
        <p>© 2025 Optic</p>
        <span className={'text-neutral-400'}>·</span>
        <Link href="https://github.com/ardasarico/optic.social" className={'hover:text-neutral-700'} target={'_blank'}>
          GitHub
        </Link>
      </div>
    </div>
  );
}

export default function StepsContainer() {
  return (
    <StepProvider>
      <StepsRenderer />
    </StepProvider>
  );
}
