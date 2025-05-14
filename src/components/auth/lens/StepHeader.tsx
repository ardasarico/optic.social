import React from 'react';

interface StepHeaderProps {
  icon: React.ReactNode;
  title: React.ReactNode | string;
  description?: string;
}

const StepHeader: React.FC<StepHeaderProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-blue/10 text-blue flex aspect-square w-14 items-center justify-center rounded-full text-[32px]">{icon}</div>
      <div className="mt-5 flex flex-col items-center gap-2">
        <p className="font-openrunde text-[24px] leading-[32px] font-semibold tracking-[-0.48px] text-neutral-800">{title}</p>
        {description && <p className="max-w-[384px] text-center leading-[24px] text-neutral-600">{description}</p>}
      </div>
    </div>
  );
};

export default StepHeader;
