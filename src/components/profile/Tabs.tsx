'use client';
import { useState, useEffect } from 'react';
import UserPosts from './UserPosts';
import CreatorPosts from './CreatorPosts';
import { getLensClient } from '@/lib/lens/client';
import { fetchAccount } from '@lens-protocol/client/actions';

interface TabsProps {
  address: string;
}

const Tabs = ({ address }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'subscribers'>('posts');
  const [isCreator, setIsCreator] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const client = await getLensClient();
        if (!client.isSessionClient()) return;

        const targetAccount = await fetchAccount(client, { address }).unwrapOr(null);
        if (!targetAccount) return;

        // Check if target account is a creator
        const creatorStatus = targetAccount.metadata?.attributes?.find((attr) => attr.key === 'isCreator')?.value === 'true';
        setIsCreator(creatorStatus || false);

        // Check subscription status from localStorage
        const subscriptions = localStorage.getItem('subscriptions');
        if (subscriptions) {
          try {
            const subscribedTo = JSON.parse(subscriptions);
            setIsSubscribed(subscribedTo.includes(address));
          } catch {
            setIsSubscribed(false);
          }
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setIsCreator(false);
        setIsSubscribed(false);
      }
    };

    checkStatus();
  }, [address]);

  // If we switch to subscribers tab but we're not subscribed, switch back to posts
  useEffect(() => {
    if (activeTab === 'subscribers' && !isSubscribed) {
      setActiveTab('posts');
    }
  }, [activeTab, isSubscribed]);

  const showSubscribersTab = isCreator && isSubscribed;

  return (
    <div className="mt-3 flex w-full flex-col gap-3">
      <div className="flex items-center gap-5 font-medium text-neutral-600">
        <button className={`cursor-pointer ${activeTab === 'posts' ? 'text-neutral-800' : ''}`} onClick={() => setActiveTab('posts')}>
          Public
        </button>
        {showSubscribersTab && (
          <button className={`cursor-pointer ${activeTab === 'subscribers' ? 'text-neutral-800' : ''}`} onClick={() => setActiveTab('subscribers')}>
            Subscribers
          </button>
        )}
      </div>
      {activeTab === 'posts' ? <UserPosts address={address} /> : <CreatorPosts address={address} />}
    </div>
  );
};

export default Tabs;
