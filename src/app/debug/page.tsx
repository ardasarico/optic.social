'use client';

import React from 'react';
import { ConnectKitButton, Avatar } from 'connectkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

const Page = () => {
  const { address, status, chainId } = useAccount();

  return (
    <div className={'w-full flex-col h-screen flex items-center justify-center gap-3'}>
      DEBUG PAGE DEV ONLY
      <ConnectKitButton />
      <div className={'flex flex-col gap-1'}>
        <Avatar />
        <p>adress: {address}</p>
        <p>status: {status}</p>
        <p>chain: {chainId}</p>
      </div>
      <Link href={'/'}>go to app</Link>
    </div>
  );
};

export default Page;
