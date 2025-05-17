'use client';

import Post, { PostProps } from './post';

const posts: PostProps[] = [
  {
    id: '0x01',
    author: {
      address: '0x123456789abcdef',
      profileImage: '/media/placeholders/profile.png',
      name: 'Benji Taylor',
      handle: '@benjitaylor',
    },
    timestamp: '3h',
    metadata: {
      content: 'Every personal website is a playground',
    },
    stats: {
      comments: 25,
      reactions: 952,
      reposts: 45,
      quotes: 12,
    },
  },
  {
    id: '0x02',
    author: {
      address: '0x234567890abcdef',
      profileImage: '/media/placeholders/profile.png',
      name: 'Alex Vanderzon',
      handle: '@alex',
    },
    timestamp: '1h',
    metadata: {
      content: "What's your favourite software and why?",
    },
    stats: {
      comments: 6,
      reactions: 89,
      reposts: 3,
      quotes: 1,
    },
  },
  {
    id: '0x03',
    author: {
      address: '0x3456789abcdef01',
      profileImage: '/media/placeholders/profile.png',
      name: 'Lochie',
      handle: '@lochie',
    },
    timestamp: '2d',
    metadata: {
      content: 'The amount of people who have adopted ConnectKit for their apps is incredible! Warms my heart whenever I see our work out in the wild.',
      media: [
        {
          url: 'https://picsum.photos/1200/950',
          type: 'image/jpeg',
        },
      ],
    },
    stats: {
      comments: 8,
      reactions: 72,
      reposts: 12,
      quotes: 2,
    },
  },
];

const Feed = () => {
  return (
    <div className="flex w-full flex-col gap-3">
      {posts && posts.length > 0 ? posts.map((post) => <Post key={post.id} {...post} />) : <div className="p-4 text-center text-neutral-500">No posts to display</div>}
    </div>
  );
};

export default Feed;
