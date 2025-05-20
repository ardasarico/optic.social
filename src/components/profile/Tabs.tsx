'use client';
import { useState } from 'react';
import UserPosts from './UserPosts';

interface TabsProps {
  address: string;
}

const Tabs = ({ address }: TabsProps) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'subscribers'>('posts');

  return (
    <div className="mt-3 flex w-full flex-col gap-3">
      <div className="flex items-center gap-5 font-medium text-neutral-600">
        <button className={`cursor-pointer ${activeTab === 'posts' ? 'text-neutral-800' : ''}`} onClick={() => setActiveTab('posts')}>
          Public
        </button>
        <button className={`cursor-pointer ${activeTab === 'subscribers' ? 'text-neutral-800' : ''}`} onClick={() => setActiveTab('subscribers')}>
          Subscribers
        </button>
      </div>
      {activeTab === 'posts' ? <UserPosts address={address} /> : <div className="p-4 text-center text-neutral-500">Coming soon...</div>}
    </div>
  );
};

export default Tabs;
