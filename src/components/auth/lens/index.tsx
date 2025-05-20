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
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          className={'flex h-fit w-[384px] flex-col items-center justify-center gap-6 overflow-visible'}
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
      <div className={'absolute bottom-6 flex items-center gap-2 text-[13px] leading-[16px] text-neutral-600'}>
        <p>© 2025 Optic</p>
        <p className={'font-bold text-neutral-500'}>·</p>
        <Link href="https://github.com/ardasarico/optic.social" target={'_blank'} className={'transition duration-200 ease-out hover:text-neutral-800'}>
          GitHub
        </Link>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <StepProvider>
      <StepsRenderer />
    </StepProvider>
  );
}
