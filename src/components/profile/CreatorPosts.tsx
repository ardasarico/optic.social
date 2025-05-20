'use client';

import { useEffect, useState } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { evmAddress } from '@lens-protocol/client';
import { fetchPosts } from '@lens-protocol/client/actions';
import Post, { PostProps } from '@/components/Feed/post';
import PostSkeleton from '@/components/ui/PostSkeleton';

const CREATORS_FEED_ADDRESS = '0xdd48E53Db6E53682C2f9b01d29460462e84a9354';

interface CreatorPostsProps {
  address: string;
}

const CreatorPosts = ({ address }: CreatorPostsProps) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchCreatorPosts() {
    setLoading(true);

    try {
      const client = await getLensClient();
      const result = await fetchPosts(client, {
        filter: {
          authors: [evmAddress(address)],
          feeds: [
            {
              feed: evmAddress(CREATORS_FEED_ADDRESS),
            },
          ],
        },
      });

      if (result.isErr()) {
        setError(result.error.message || 'Error fetching posts');
        setLoading(false);
        return;
      }

      const posts = result.value.items;
      setData(posts);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchCreatorPosts();
  }, [address]);

  const mapPosts = (posts: any[]) => {
    return posts.map((post: any) => {
      const meta = post.metadata;
      const media: { url: string; type: string }[] = [];
      if (meta?.image && meta?.image.item && meta?.image.type) {
        media.push({ url: meta.image.item, type: meta.image.type });
      }
      if (Array.isArray(meta?.attachments)) {
        for (const att of meta.attachments) {
          if (att.item && att.type) {
            media.push({ url: att.item, type: att.type });
          }
        }
      }
      const mapped: PostProps = {
        id: post.id,
        author: {
          address: post.author?.address || '',
          profileImage: post.author?.metadata?.picture || '/media/placeholders/profile.png',
          name: post.author?.metadata?.name || '',
          handle: post.author?.username?.localName ? `@${post.author.username.localName}` : post.author?.address?.slice(0, 8) || '',
        },
        timestamp: post.createdAt ? new Date(post.createdAt).toLocaleString() : '',
        metadata: {
          content: meta?.content || '',
          media: media.length > 0 ? media : undefined,
        },
        stats: {
          comments: post.stats?.comments || 0,
          reactions: post.stats?.reactions || 0,
          reposts: post.stats?.reposts || 0,
          quotes: post.stats?.quotes || 0,
        },
      };
      return <Post key={mapped.id} {...mapped} />;
    });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {error && <div className="text-red-500">{error}</div>}
      {loading && !data ? <PostSkeleton /> : data && data.length > 0 ? mapPosts(data) : <div className="p-4 text-center text-neutral-500">No subscriber-only posts to display</div>}
    </div>
  );
};

export default CreatorPosts;
