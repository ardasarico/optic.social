import React from 'react';

import { useStep } from '../StepContext';

const Select = () => {
  const { next, prev } = useStep();

  return (
    <div className={'flex flex-col gap-2'}>
      <p>start step</p>
      <button onClick={prev}>prev</button>
      <button onClick={next}>next</button>
    </div>
  );
};

export default Select;
