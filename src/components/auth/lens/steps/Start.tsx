'use client';

import StepHeader from '../StepHeader';
import IconPerson from '@icon/person.svg';
import IconStar from '@icon/star.svg';
import IconHearth from '@icon/hearthFill.svg';
import { useRouter } from 'next/navigation';

const Start = () => {
  const router = useRouter();

  const handleContinueAsMember = async () => {
    router.push(`/`);
    window.location.reload();
  };
  const handleBecomeaCreator = async () => {
    router.push(`/becomeacreator`);
    window.location.reload();
  };

  return (
    <div className={'flex flex-col gap-6'}>
      <StepHeader icon={<IconPerson />} title="Let's get you started" description="How would you like to start? You can always become a creator later." />
      <div className="flex items-stretch gap-5">
        <div
          onClick={handleBecomeaCreator}
          className="flex w-[288px] cursor-pointer flex-col gap-5 rounded-[24px] bg-neutral-200 p-5 pr-3 transition duration-200 ease-out hover:bg-neutral-300 active:scale-[0.99]">
          <div className="bg-purple flex aspect-square w-[56px] items-center justify-center rounded-full text-[32px] text-neutral-100">
            <IconStar />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[18px] leading-[24px] font-medium text-neutral-800">Become a Creator</div>
            <div className="text-[14px] leading-[20px] text-neutral-600">Publish exclusive content, build your community, and earn on-chain.</div>
          </div>
        </div>
        <div
          onClick={handleContinueAsMember}
          className={'flex w-[288px] cursor-pointer flex-col gap-5 rounded-[24px] bg-neutral-200 p-5 pr-3 transition duration-200 ease-out hover:bg-neutral-300 active:scale-[0.99]'}>
          <div className="bg-green flex aspect-square w-[56px] items-center justify-center rounded-full text-[32px] text-neutral-100">
            <IconHearth />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[18px] leading-[24px] font-medium text-neutral-800">Continue as Member</div>
            <div className="text-[14px] leading-[20px] text-neutral-600">Explore creators, support content you love, and connect with others.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Start;
