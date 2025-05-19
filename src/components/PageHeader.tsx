'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { fetchAccount } from '@lens-protocol/client/actions';

import IconChevronLeft from '@icon/chevron-left.svg';

interface PageHeaderProps {
  title?: string;
  link?: string;
}

const STATIC_PAGES: Record<string, string> = {
  '/': 'Home',
  '/explore': 'Explore',
  '/debug': 'Debug',
};

const getTitleForPath = (pathname: string, userHandle: string | null): string => {
  if (pathname.includes('/settings')) return 'Settings';
  if (STATIC_PAGES[pathname]) return STATIC_PAGES[pathname];
  const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  if (userHandle && cleanPath === userHandle) return 'Profile';
  if (/^[a-zA-Z0-9_]+$/.test(cleanPath)) return `@${cleanPath}`;
  return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
};

const PageHeader: React.FC<PageHeaderProps> = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [userHandle, setUserHandle] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHandle() {
      try {
        const client = await getLensClient();
        if (!client.isSessionClient()) return;
        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) return;
        const account = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
        const handle = account?.username?.localName;
        if (handle) setUserHandle(handle);
      } catch {}
    }
    fetchHandle();
  }, []);

  const title = getTitleForPath(pathname, userHandle);
  const isStaticPage = !!STATIC_PAGES[pathname];

  return (
    <div className={'relative flex h-[56px] w-full flex-none items-center justify-center shadow-[0px_-1px_0px_0px_#ECEEF0_inset]'}>
      {!isStaticPage && title !== 'Profile' && (
        <button className="absolute left-4 p-0.5 text-neutral-600 transition duration-200 ease-out hover:text-neutral-700 active:scale-[90%]" aria-label="Go back" onClick={() => router.back()}>
          <IconChevronLeft />
        </button>
      )}
      <p className={'text-[18px] leading-[24px] font-medium capitalize'}>{title}</p>
    </div>
  );
};

export default PageHeader;
