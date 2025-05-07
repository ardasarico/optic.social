'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  const { status, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (status === 'disconnected') {
      router.replace('/login');
    }
  }, [status, router]);

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
}
