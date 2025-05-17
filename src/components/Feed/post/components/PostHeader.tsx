'use client';

import IconEllipsis from '@icon/ellipsis.svg';

interface PostHeaderProps {
  name: string;
  handle: string;
  timePosted: string;
}

const PostHeader = ({ name, handle, timePosted }: PostHeaderProps) => {
  return (
    <div className="flex w-full items-center gap-2">
      <p className="text-[16px] leading-[24px] font-medium">{name}</p>
      <span className='"text-[14px] leading-[20px] font-bold text-neutral-400'>·</span>
      <p className="text-[14px] leading-[20px] font-medium text-neutral-600">{handle}</p>
      <p className="text-[14px] leading-[20px] text-neutral-600">{timePosted}</p>
      <button className="ml-auto cursor-pointer p-0.5 text-[20px] text-neutral-500 transition duration-200 ease-out hover:text-neutral-600 active:scale-[95%]">
        <IconEllipsis />
      </button>
    </div>
  );
};

export default PostHeader;
