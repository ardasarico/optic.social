'use client';

import Post, { PostProps } from './post';
import { useEffect, useState } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { evmAddress } from '@lens-protocol/client';
import { fetchPosts } from '@lens-protocol/client/actions';

const FEED_APP_ADDRESS = '0x59d5e65777914d474E26d7416894752c6849516d';

const Feed = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);

    const cachedData = sessionStorage.getItem('feedData');
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      setData(parsedCache);
    }

    try {
      const client = await getLensClient();
      const result = await fetchPosts(client, {
        filter: {
          feeds: [
            {
              app: evmAddress(FEED_APP_ADDRESS),
            },
          ],
        },
      });
      if (result.isErr()) {
        setError(result.error.message || 'Error fetching posts');
        setLoading(false);
        return;
      }
      const newData = result.value.items;
      if (JSON.stringify(newData) !== JSON.stringify(data)) {
        setData(newData);
        sessionStorage.setItem('feedData', JSON.stringify(newData));
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex w-full flex-col gap-3">
      {error && <div className="text-red-500">{error}</div>}
      {loading && !data ? (
        <div>Loading...</div>
      ) : data && data.length > 0 ? (
        data.map((post: any) => {
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
        })
      ) : (
        <div className="p-4 text-center text-neutral-500">No posts to display</div>
      )}
    </div>
  );
};

export default Feed;
