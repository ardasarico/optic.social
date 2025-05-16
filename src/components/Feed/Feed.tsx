'use client';

import Post, { PostProps } from './Post';

export type PostData = PostProps;

type FeedProps = {
  posts?: PostProps[];
};

const Feed = ({ posts = [] }: FeedProps) => {
  return (
    <div className="flex w-full flex-col gap-3">
      {posts && posts.length > 0 ? posts.map((post) => <Post key={post.id} {...post} />) : <div className="p-4 text-center text-neutral-500">No posts to display</div>}
    </div>
  );
};

export default Feed;
