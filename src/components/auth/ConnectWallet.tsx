'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import Link from 'next/link';

import IconFamily from '@icon/family.svg';

import { ConnectKitButton } from 'connectkit';

const ConnectWallet = () => {
  return (
    <div className={'relative flex h-screen min-h-fit w-screen flex-col items-center justify-center p-8'}>
      <Image src="/logo.svg" width={96} height={96} alt={'Logo'} />
      <p className={'font-openrunde mt-5 text-[24px] leading-[32px] font-semibold tracking-[-0.48px] text-neutral-800'}>Welcome to Optic</p>
      <p className={'mt-2 max-w-[384px] text-center leading-[24px] text-neutral-600'}>Discover, subscribe and support your favorite creators, all in one beautiful, decentralized place.</p>

      <ConnectKitButton.Custom>
        {({ show, isConnecting, isConnected }) => {
          return (
            <Button onClick={show} disabled={isConnected && isConnecting} size={'large'} fill className={'mt-[48px] max-w-[320px] bg-neutral-800'}>
              <div className={'p-0.5 text-[20px]'}>
                <IconFamily />
              </div>
              Continue with Family
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
      <button className={'mt-5 cursor-pointer text-[14px] leading-[20px] font-medium text-neutral-600 transition duration-200 ease-out hover:text-[#2C2D30]'}>
        <span className={'text-neutral-500'}>or</span> use another wallet
      </button>

      <div className={'absolute bottom-6 flex items-center gap-2 text-[13px] leading-[16px] text-neutral-600'}>
        <p>© 2025 Optic</p>
        <p className={'font-bold text-neutral-500'}>·</p>
        <Link href="https://github.com/ardasarico/optic.social" target={'_blank'} className={'transition duration-200 ease-out hover:text-neutral-700'}>
          GitHub
        </Link>
      </div>
    </div>
  );
};

export default ConnectWallet;
