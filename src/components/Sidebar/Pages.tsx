'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { fetchAccount } from '@lens-protocol/client/actions';

import IconHome from '@icon/home.svg';
import IconHomeFill from '@icon/homeFill.svg';
import IconExplore from '@icon/compass.svg';
import IconExploreFill from '@icon/compassFill.svg';
import IconProfile from '@icon/person.svg';
import IconProfileFill from '@icon/personFill.svg';

const Pages = () => {
  const pathname = usePathname();
  const [profileHref, setProfileHref] = useState('/profile');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchHandle() {
      try {
        const client = await getLensClient();
        if (!client.isSessionClient()) return;
        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) return;
        const account = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
        const handle = account?.username?.localName;
        if (handle && mounted) {
          setProfileHref(`/${handle}`);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchHandle();
    return () => {
      mounted = false;
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', icon: <IconHome />, iconFill: <IconHomeFill /> },
    { href: '/explore', label: 'Explore', icon: <IconExplore />, iconFill: <IconExploreFill /> },
    { href: profileHref, label: 'Profile', icon: <IconProfile />, iconFill: <IconProfileFill /> },
  ];

  return (
    <div className="flex w-full flex-col gap-0.5">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex items-center gap-3 rounded-[12px] px-3 py-3 leading-[24px] font-medium ${pathname === link.href ? 'bg-neutral-200! text-neutral-800' : 'text-neutral-600'}`}
          aria-current={'page'}>
          <span className={'p-0.5 text-[20px]'}>{pathname === link.href ? link.iconFill : link.icon}</span>
          <p>{link.label}</p>
        </Link>
      ))}
    </div>
  );
};

export default Pages;
