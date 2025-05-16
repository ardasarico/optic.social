'use client';

import { useState } from 'react';
import Content from './components/PostContent';
import PostHeader from './components/PostHeader';
import PostActions from './components/PostActions';

export type PostMetadata = {
  content: string;
  media?: Array<{
    url: string;
    type: string;
  }>;
};

export type PostStats = {
  comments: number;
  reactions: number;
  reposts: number;
  quotes: number;
};

export type PostProps = {
  id: string;
  author: {
    address: string;
    profileImage: string;
    name: string;
    handle: string;
  };
  timestamp: string;
  metadata: PostMetadata;
  stats: PostStats;
};

const Post = (props: PostProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(props.stats.reactions);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="flex w-full items-start gap-4 py-6 shadow-[0px_2px_0px_0px_#F8F9FA_inset]">
      <div className="aspect-square w-10 flex-none overflow-hidden rounded-full bg-neutral-300">
        <img src={props.author.profileImage || '/media/placeholders/profile.png'} alt="poster pp" />
      </div>
      <div className="flex w-full flex-col">
        <PostHeader name={props.author.name} handle={props.author.handle} timePosted={props.timestamp} />
        <Content content={props.metadata.content} media={props.metadata.media} />
        <PostActions commentCount={props.stats.comments} likesCount={likesCount} isLiked={isLiked} onLike={handleLike} />
      </div>
    </div>
  );
};

export default Post;
