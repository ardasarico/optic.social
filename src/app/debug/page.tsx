'use client';

import React, { useEffect, useState } from 'react';
import { ConnectKitButton, Avatar } from 'connectkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { getLensClient } from '@/lib/lens/client';
import { fetchAccount } from '@lens-protocol/client/actions';
import { deleteCookie, getCookies } from 'cookies-next';
import type { Account as LensAccount } from '@lens-protocol/client';
import Button from '@/components/ui/Button';

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
    setTimeout(() => setCleared(false), 3000);
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
    <div className="flex min-h-screen w-full flex-col bg-white">
      <div className="relative flex h-[56px] w-full flex-none items-center justify-center shadow-[0px_-1px_0px_0px_#ECEEF0_inset]">
        <p className="text-[18px] leading-[24px] font-medium">Debug</p>
        <Link href="/" className="text-blue absolute right-4 transition duration-200 ease-out hover:opacity-90">
          Go to app
        </Link>
      </div>

      <div className="flex w-full flex-col items-center gap-32 p-6">
        {/* Wallet Section */}
        <div className="w-full max-w-2xl">
          <h2 className="mb-4 text-xl font-medium">Wallet Connection</h2>
          <div className="flex flex-col gap-4">
            <ConnectKitButton />
            <div className="mt-2 flex items-center gap-3">
              <Avatar address={address} />
              <div className="flex flex-col">
                <p className="text-neutral-900">{address ?? 'Not connected'}</p>
                <p className="text-sm text-neutral-600">
                  Status: {status} • Chain: {chainId ?? 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lens Account Section */}
        <div className="w-full max-w-2xl">
          <h2 className="mb-4 text-xl font-medium">Lens Account</h2>
          {account ? (
            <>
              <div className="flex items-start gap-4">
                {account.metadata?.picture && <img src={account.metadata.picture} alt="Profile" className="h-16 w-16 rounded-full object-cover" />}
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{account.metadata?.name || 'No Name'}</h3>
                  <p className="text-sm text-neutral-600">{account.metadata?.id ?? 'No id'}</p>
                  {account.metadata?.bio && <p className="mt-2 text-neutral-800">{account.metadata.bio}</p>}
                  <p className="mt-2 text-sm text-neutral-500">Wallet: {account.address}</p>
                </div>
              </div>

              <div className="mt-6 w-full">
                <h3 className="text-md mb-2 font-medium">Raw Account Data:</h3>
                <pre className="max-h-80 w-full overflow-auto rounded-md bg-neutral-50 p-4 text-xs">{JSON.stringify(account, null, 2)}</pre>
              </div>
            </>
          ) : (
            <p className="text-neutral-600">Loading account or not logged in with Lens...</p>
          )}
        </div>

        {/* Debug Controls Section */}
        <div className="w-full max-w-2xl">
          <h2 className="mb-4 text-xl font-medium">Debug Controls</h2>
          <div className="flex items-center gap-4">
            <Button variant="secondary" onClick={handleClearCookies} className="bg-red-500 text-white hover:bg-red-600">
              Clear All Cookies
            </Button>
            {cleared && <p className="animate-pulse text-green-600">All cookies cleared successfully!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
