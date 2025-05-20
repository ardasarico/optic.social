'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import IconChevronLeft from '@icon/chevron-left.svg';
import TextArea from '@/components/ui/TextArea';
import { useState } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { MetadataAttributeType, account } from '@lens-protocol/metadata';
import { setAccountMetadata, fetchAccount } from '@lens-protocol/client/actions';
import { uri } from '@lens-protocol/client';
import { StorageClient, immutable } from '@lens-chain/storage-client';

const BecomeaCreator = () => {
  const router = useRouter();
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!about.trim()) return;

    try {
      setLoading(true);
      const client = await getLensClient();
      if (!client.isSessionClient()) {
        alert('Please connect your wallet first');
        return;
      }

      const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
      if (!authenticatedUser) {
        alert('Please connect your wallet first');
        return;
      }

      const currentAccount = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
      if (!currentAccount) {
        alert('Failed to fetch account');
        return;
      }

      const metadata = account({
        name: currentAccount.metadata?.name || authenticatedUser.address.slice(0, 8),
        bio: currentAccount.metadata?.bio || '',
        picture: currentAccount.metadata?.picture || undefined,
        coverPicture: currentAccount.metadata?.coverPicture || undefined,
        attributes: [
          ...(currentAccount.metadata?.attributes || []).filter((attr) => attr.key !== 'isCreator' && attr.key !== 'description'),
          {
            key: 'isCreator',
            type: MetadataAttributeType.BOOLEAN,
            value: 'true',
          },
          {
            key: 'description',
            type: MetadataAttributeType.STRING,
            value: about,
          },
        ],
      });

      const storageClient = StorageClient.create();
      const { uri: metadataUri } = await storageClient.uploadFile(new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }), { acl: immutable(37111) });

      await setAccountMetadata(client, {
        metadataUri: uri(metadataUri),
      });

      router.push('/');
    } catch (error: any) {
      alert(error.message || 'Failed to become a creator');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center">
      <div className="flex h-full w-[50vw] items-center justify-center">
        <div className="flex w-[336px] flex-col gap-6">
          <div className="flex w-full flex-col gap-5">
            <Link href={'/'} className="flex items-center gap-2 text-neutral-500 transition duration-200 ease-out hover:text-neutral-600">
              <IconChevronLeft />
              <p>Back</p>
            </Link>
            <div className='"w-full flex flex-col gap-2'>
              <p className="text-[24px] leading-[32px] font-semibold">Create your membership</p>
              <p className="text-neutral-600">Give your fans a way to support you and offer exclusive perks.</p>
            </div>
            <TextArea lines={5} label="About" placeholder="Tell your fans what they'll get..." value={about} onChange={(e) => setAbout(e.target.value)} />
          </div>
          <Button size="large" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : 'Become a Creator'}
          </Button>
        </div>
        <div className={'absolute bottom-6 flex items-center gap-2 text-[13px] leading-[16px] text-neutral-600'}>
          <p>© 2025 Optic</p>
          <p className={'text-neutral-500'}>·</p>
          <Link href="https://github.com/ardasarico/optic.social" target={'_blank'} className={'transition duration-200 ease-out hover:text-neutral-800'}>
            GitHub
          </Link>
        </div>
      </div>
      <div className="relative h-full w-[50vw] overflow-hidden bg-neutral-200">
        <img src={'/media/assets/becomeacreator-bg.svg'} className="h-full w-full bg-center object-cover" />
      </div>
    </div>
  );
};

export default BecomeaCreator;
