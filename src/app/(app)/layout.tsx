'use client';

import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import ConnectWallet from '@/components/auth/ConnectWallet';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const { status, isConnected } = useAccount();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted || status === 'connecting') {
    return <div className={'w-screen h-screen flex items-center justify-center bg-neutral-300'}>loading...</div>;
  }

  if (!isConnected) {
    return <ConnectWallet />;
  }

  return <>{children}</>;
}
