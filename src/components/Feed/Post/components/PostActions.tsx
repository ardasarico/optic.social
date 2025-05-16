'use client';

import IconBubble from '@icon/bubble.svg';
import IconHearth from '@icon/hearth.svg';
import IconHearthFill from '@icon/hearthFill.svg';
import IconShare from '@icon/share.svg';

interface PostActionsProps {
  commentCount: number;
  likesCount: number;
  isLiked: boolean;
  onLike: () => void;
}

const PostActions = ({ commentCount, likesCount, isLiked, onLike }: PostActionsProps) => {
  return (
    <div className="mt-2 flex h-8 w-full items-center gap-6 text-[14px] font-medium text-neutral-600">
      <button className="flex cursor-pointer items-center gap-1 transition duration-200 ease-out hover:text-neutral-700 active:scale-[96%]">
        <span className="p-0.5 text-[20px]">
          <IconBubble />
        </span>
        <span>{commentCount}</span>
      </button>
      <button onClick={onLike} className={`flex cursor-pointer items-center gap-1 transition duration-200 ease-out hover:text-neutral-700 active:scale-[96%] ${isLiked ? 'text-red!' : ''}`}>
        <span className="p-0.5 text-[20px]">
          {isLiked && <IconHearthFill />}
          {!isLiked && <IconHearth />}
        </span>
        <span>{likesCount}</span>
      </button>
      <button className="ml-auto cursor-pointer p-0.5 text-[20px] transition duration-200 ease-out hover:text-neutral-700 active:scale-[96%]">
        <IconShare />
      </button>
    </div>
  );
};

export default PostActions;
