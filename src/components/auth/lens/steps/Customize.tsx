'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { fetchAccount, setAccountMetadata } from '@lens-protocol/client/actions';
import { uri, TxHash, ResultAsync, UnexpectedError, TransactionIndexingError } from '@lens-protocol/client';
import { handleOperationWith } from '@lens-protocol/client/viem';
import '@lens-protocol/client';
import { useStep } from '../StepContext';
import IconPencil from '@icon/pencil.svg';
import IconEllipsis from '@icon/ellipsis.svg';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import Button from '@/components/ui/Button';
import { account as accountMetadataBuilder } from '@lens-protocol/metadata';
import { useWalletClient } from 'wagmi';
import { StorageClient, lensAccountOnly } from '@lens-chain/storage-client';
import StepHeader from '../StepHeader';

const resolveImage = (picture: any): string => {
  if (!picture) return '/media/placeholders/profile.png';
  if (typeof picture === 'string') return picture;

  const uri = picture?.optimized?.uri || picture?.original?.uri || picture?.uri || picture?.original?.url || '';
  if (!uri) return '/media/placeholders/profile.png';

  return uri;
};

const Customize = () => {
  const { next, prev, setStepIndex } = useStep();
  const [selectedImage, setSelectedImage] = useState<string | File>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialPictureUri, setInitialPictureUri] = useState<string | null>(null);
  const [initialName, setInitialName] = useState('');
  const [initialBio, setInitialBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setLoading(true);
        const client = await getLensClient();
        if (!client.isSessionClient()) return;

        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) return;

        const acc = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
        if (acc) {
          const pictureUri = acc.metadata?.picture?.uri || acc.metadata?.picture;
          const pictureUrl = resolveImage(acc.metadata?.picture);

          setSelectedImage(pictureUri || '');
          setCurrentImageUrl(pictureUrl);
          setInitialPictureUri(pictureUri || null);

          const accountName = acc.metadata?.name || '';
          const accountBio = acc.metadata?.bio || '';

          setName(accountName);
          setBio(accountBio);
          setInitialName(accountName);
          setInitialBio(accountBio);
        }
      } catch (error) {
        console.error('Failed to load account:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, []);

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const imageUrl: string = URL.createObjectURL(file);
      setCurrentImageUrl(imageUrl);
    }
  };

  const hasChanges = () => {
    const imageChanged = selectedImage instanceof File;
    const nameChanged = name !== initialName;
    const bioChanged = bio !== initialBio;

    return imageChanged || nameChanged || bioChanged;
  };

  const handleUpdateProfile = async () => {
    if (!hasChanges()) {
      next();
      return;
    }

    if (!walletClient) {
      return;
    }

    setSubmitting(true);
    try {
      const lensClient = await getLensClient();

      if (!lensClient.isSessionClient()) {
        setSubmitting(false);
        return;
      }

      const authenticatedUser = lensClient.getAuthenticatedUser().unwrapOr(null);
      if (!authenticatedUser) {
        setSubmitting(false);
        return;
      }

      const storageClient = StorageClient.create();
      let finalPictureUri = initialPictureUri;

      if (selectedImage instanceof File) {
        const acl = lensAccountOnly(authenticatedUser.address, walletClient.chain.id);

        if (initialPictureUri && initialPictureUri.startsWith('lens://')) {
          const uploadResponse = await storageClient.editFile(initialPictureUri, selectedImage, walletClient, { acl });
          finalPictureUri = uploadResponse.uri;
        } else {
          const uploadResponse = await storageClient.uploadFile(selectedImage, { acl });
          finalPictureUri = uploadResponse.uri;
        }
      } else if (typeof selectedImage === 'string' && selectedImage) {
        finalPictureUri = selectedImage;
      } else {
        finalPictureUri = null;
      }

      const metadataToUpload = accountMetadataBuilder({
        name: name || undefined,
        bio: bio || undefined,
        picture: finalPictureUri || undefined,
      });

      const metadataJsonFile = new File([JSON.stringify(metadataToUpload)], 'metadata.json', { type: 'application/json' });
      const metadataUploadAcl = lensAccountOnly(authenticatedUser.address, walletClient.chain.id);

      const metadataUploadResponse = await storageClient.uploadFile(metadataJsonFile, { acl: metadataUploadAcl });
      const actualMetadataLensUri = metadataUploadResponse.uri;

      const result = await setAccountMetadata(lensClient, {
        metadataUri: uri(actualMetadataLensUri),
      })
        .andThen(handleOperationWith(walletClient))
        .andThen((txHash: TxHash): ResultAsync<TxHash, UnexpectedError | TransactionIndexingError> => {
          return lensClient.waitForTransaction(txHash);
        });

      if (result.isErr()) {
        setSubmitting(false);
        return;
      }

      next();
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    next();
  };

  return (
    <>
      <StepHeader
        icon={<IconPencil />}
        title={
          <>
            Customize <span className={'text-neutral-500'}>@</span>eugrl
          </>
        }
        description="Add name, bio and an image to your account."
      />
      <div className={'flex w-full flex-col gap-5 px-6'}>
        <div className={'flex h-[144px] w-full cursor-pointer items-center justify-center rounded-[24px] border-2 border-neutral-300'} onClick={handleContainerClick}>
          <div className={'relative flex aspect-square w-[96px] items-center justify-center rounded-full bg-neutral-400'}>
            <img
              src={currentImageUrl || '/media/placeholders/profile.png'}
              alt="Profile"
              className={`h-full w-full rounded-full object-cover ${loading && !currentImageUrl ? 'animate-pulse opacity-50' : ''}`}
              onError={(e) => {
                console.error('Image failed to load:', currentImageUrl);
                e.currentTarget.src = '/media/placeholders/profile.png';
              }}
            />
            <div className={'absolute -right-0.5 -bottom-0.5 flex aspect-square w-[28px] items-center justify-center rounded-full bg-neutral-100 drop-shadow-lg'}>
              <IconEllipsis />
            </div>
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageChange} />
        </div>
        <Input placeholder={'Display Name'} label="Name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
        <TextArea placeholder={'Write a short bio'} label="Bio" value={bio} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)} />
        <Button size={'large'} onClick={handleUpdateProfile} disabled={submitting || loading}>
          {submitting ? 'Updating...' : 'Continue'}
        </Button>

        <button onClick={handleSkip} className="cursor-pointer text-[14px] leading-[20px] text-neutral-600 hover:text-neutral-700">
          <span className="text-neutral-500!">Don't want to customize?</span> Skip for now
        </button>
      </div>
    </>
  );
};

export default Customize;
