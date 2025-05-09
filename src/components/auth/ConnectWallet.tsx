'use client';

import Image from 'next/image';
import Button from '@/components/ui/Button';
import Link from 'next/link';

import IconFamily from '@icon/family.svg';

import { ConnectKitButton } from 'connectkit';

const ConnectWallet = () => {
  return (
    <div className={'w-screen h-screen relative flex items-center justify-center p-8 min-h-fit flex-col'}>
      <Image src="/logo.svg" width={96} height={96} alt={'Logo'} />
      <p className={'text-[24px] font-semibold leading-[32px] text-[#2C2D30] mt-5 font-openrunde'}>Welcome to Optic</p>
      <p className={'text-[#2C2D30]/60 leading-[24px] max-w-[384px] text-center mt-2'}>Discover, subscribe and support your favorite creators, all in one beautiful, decentralized place.</p>

      <ConnectKitButton.Custom>
        {({ show, isConnecting, isConnected }) => {
          return (
            <Button onClick={show} disabled={isConnected && isConnecting} size={'large'} fill className={'max-w-[320px] mt-12'}>
              <IconFamily />
              Continue with Family
            </Button>
          );
        }}
      </ConnectKitButton.Custom>
      <button className={'text-[14px] leading-[20px] cursor-pointer mt-4 font-medium text-[#2C2D30]/60 hover:text-[#2C2D30] transition ease-out duration-200'}>
        <span className={'text-[#2C2D30]/40'}>or</span> use another wallet
      </button>
      <div className={'absolute bottom-6 flex items-center gap-2 text-[#2C2D30]'}>
        <p className={'opacity-60'}>© 2025 Optic</p>
        <p className={'opacity-60'}>·</p>
        <Link href="https://github.com/" target={'_blank'} className={'opacity-60 hover:opacity-100 transition ease-out duration-200'}>
          GitHub
        </Link>
      </div>
    </div>
  );
};

export default ConnectWallet;
