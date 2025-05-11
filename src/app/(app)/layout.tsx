'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

import ConnectWallet from '@/components/auth/ConnectWallet';
import Login from '@/components/auth/lens';

import { getLensClient } from '@/lib/lens/client';
import { fetchAccount } from '@lens-protocol/client/actions';

async function getAuthenticatedAccount() {
  try {
    const client = await getLensClient();

    if (!client.isSessionClient()) {
      return null;
    }

    const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
    if (!authenticatedUser) {
      return null;
    }

    return fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
  } catch (error) {
    console.error('Failed to get authenticated account', error);
    return null;
  }
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const { status, isConnected } = useAccount();
  const [hasMounted, setHasMounted] = useState(false);
  const [lensAccount, setLensAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    async function checkLens() {
      setLoading(true);
      if (!isConnected) {
        setLensAccount(null);
        setLoading(false);
        return;
      }

      const account = await getAuthenticatedAccount();
      setLensAccount(account);
      setLoading(false);
    }

    if (hasMounted) {
      checkLens();
    }
  }, [isConnected, hasMounted]);

  if (!hasMounted || status === 'connecting' || loading) {
    return <div className={'w-screen h-screen flex items-center justify-center bg-neutral-300'}>loading...</div>;
  }

  if (!isConnected) {
    return <ConnectWallet />;
  }

  if (!lensAccount && !loading && status === 'connected') {
    return <Login />;
  }

  return <>{children}</>;
}
