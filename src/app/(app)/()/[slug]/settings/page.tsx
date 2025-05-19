'use client';

import { fetchAccount } from '@lens-protocol/client/actions';
import { getLensClient } from '@/lib/lens/client';
import { deleteCookie, getCookies } from 'cookies-next';
import { useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import IconPencil from '@icon/pencil.svg';
import IconLogout from '@icon/logout.svg';
import IconHearth from '@icon/hearth.svg';
import IconChevronRight from '@icon/chevronRight.svg';
import IconStar from '@icon/star.svg';
import IconCoins from '@icon/coins.svg';

import Button from '@/components/ui/Button';

export default function SettingsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccount() {
      try {
        const lensClient = await getLensClient();
        const result = await fetchAccount(lensClient, {
          username: {
            localName: slug,
          },
        });

        if (result.isErr() || !result.value) {
          setLoading(false);
          return;
        }

        setAccount(result.value);
      } catch (error) {
        console.error('Failed to load account:', error);
      }
      setLoading(false);
    }

    loadAccount();
  }, [slug]);

  const handleLogout = () => {
    const allCookies = getCookies() as { [key: string]: string };
    Object.keys(allCookies).forEach((cookieName) => {
      deleteCookie(cookieName);
    });

    disconnect();

    router.refresh();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!account) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-6">
      <img src={account.metadata?.picture ?? '/media/placeholders/profile.png'} alt="Profile" className="aspect-square w-[112px] overflow-hidden rounded-full bg-neutral-300 object-cover" />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[28px] leading-[32px] font-semibold">{account.metadata?.name ?? ''}</p>
        <p className="text-[18px] leading-[24px] font-medium text-neutral-600">@{account.username?.localName ?? ''}</p>
      </div>
      <Button variant="secondary" size="large" fill>
        <div className="p-0.5">
          <IconPencil />
        </div>
        Edit Details
      </Button>
      <button className="flex w-full cursor-pointer items-center gap-3 rounded-[16px] bg-neutral-200 p-4">
        <div className="p-0.5">
          <IconHearth />
        </div>
        Subscriptions
        <div className="ml-auto p-0.5">
          <IconChevronRight />
        </div>
      </button>
      <div className="flex w-full flex-col gap-3">
        <p>Test</p>
        <div className="flex flex-col gap-0.5 overflow-hidden rounded-[16px]">
          <button className="flex w-full cursor-pointer items-center gap-3 rounded-[4px] bg-neutral-200 p-4">
            <div className="p-0.5">
              <IconStar />
            </div>
            Membership
            <div className="ml-auto p-0.5">
              <IconChevronRight />
            </div>
          </button>
          <button className="flex w-full cursor-pointer items-center gap-3 rounded-[4px] bg-neutral-200 p-4">
            <div className="p-0.5">
              <IconCoins />
            </div>
            Earnings
            <div className="ml-auto p-0.5">
              <IconChevronRight />
            </div>
          </button>
        </div>
      </div>
      <Button variant="secondary" size="large" fill onClick={handleLogout}>
        <div className="p-0.5">
          <IconLogout />
        </div>
        Logout
      </Button>
    </div>
  );
}
