'use client';

import React, { useEffect, useState } from 'react';
import { ConnectKitButton, Avatar } from 'connectkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { getLensClient } from '@/lib/lens/client';
import { fetchAccount } from '@lens-protocol/client/actions';
import { deleteCookie, getCookies } from 'cookies-next';
import type { Account as LensAccount } from '@lens-protocol/client';

const Page: React.FC = () => {
  const { address, status, chainId } = useAccount();
  const [account, setAccount] = useState<LensAccount | null>(null);
  const [cleared, setCleared] = useState(false);

  const handleClearCookies = () => {
    const allCookies = getCookies();
    // @ts-ignore
    Object.keys(allCookies).forEach((cookieName) => {
      deleteCookie(cookieName);
    });
    setCleared(true);
  };

  useEffect(() => {
    async function loadAccount() {
      try {
        const client = await getLensClient();
        if (!client.isSessionClient()) return;

        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) return;

        const acc = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
        setAccount(acc);
      } catch (error) {
        console.error('Failed to load account:', error);
      }
    }

    loadAccount();
  }, []);

  return (
    <div className="w-full flex-col h-screen flex items-center justify-center gap-3">
      <h1>DEBUG PAGE DEV ONLY</h1>
      <ConnectKitButton />
      <div className="flex flex-col gap-1">
        <Avatar address={address} />
        <p>Address: {address ?? 'Not connected'}</p>
        <p>Status: {status}</p>
        <p>Chain: {chainId ?? 'Unknown'}</p>
      </div>
      <Link href="/">Go to app</Link>
      {account ? (
        <div className="p-4 space-y-2">
          {account.metadata?.picture && <img src={account.metadata.picture} alt="Profile" className="w-20 h-20 rounded-full" />}
          <h2 className="text-xl font-bold">{account.metadata?.name || 'No Name'}</h2>
          <p>{account.metadata?.id ?? 'No id'}</p>
          <p>{account.metadata?.bio || 'No bio provided.'}</p>
          <p className="text-sm text-gray-500">Wallet: {account.address}</p>
        </div>
      ) : (
        <p>Loading account...</p>
      )}
      <div className="p-4">
        <h2 className="text-xl mb-4">Debug Controls</h2>
        <button onClick={handleClearCookies} className="px-4 py-2 bg-red-500 text-white rounded">
          Clear All Cookies
        </button>
        {cleared && <p className="mt-2 text-green-600">All cookies cleared!</p>}
      </div>
    </div>
  );
};

export default Page;
