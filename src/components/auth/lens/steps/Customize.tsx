import React from 'react';

import { useStep } from '../StepContext';
import IconPencil from '@icon/pencil.svg';

const Select = () => {
  const { next, prev } = useStep();

  return (
    <>
      <div className={'flex flex-col'}>
        <div className={'flex items-center justify-center w-14 aspect-square bg-blue/10 text-blue rounded-full text-[32px]'}>
          <IconPencil />
        </div>
      </div>
      <div className={'flex flex-col items-center gap-2'}>
        <p className={'text-[24px] font-semibold leading-[32px] text-neutral-800 font-openrunde'}>
          Customize <span className={'text-neutral-500'}>@</span>eugrl
        </p>
        <p className={'text-[#2C2D30]/60 leading-[24px] max-w-[384px] text-center'}>Add name, bio and an image to your account.</p>
      </div>
      <button onClick={prev}>back</button>
    </>
  );
};

export default Select;
