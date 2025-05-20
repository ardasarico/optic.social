'use client';

import { useState, useEffect, useRef } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { fetchAccount } from '@lens-protocol/client/actions';
import type { Account } from '@lens-protocol/client';
import { evmAddress, uri } from '@lens-protocol/client';
import { post as lensPost } from '@lens-protocol/client/actions';
import { textOnly, image, MediaImageMimeType, MetadataLicenseType, MetadataAttributeType, MetadataAttribute } from '@lens-protocol/metadata';
import { StorageClient, immutable } from '@lens-chain/storage-client';

import IconPhoto from '@icon/photo.svg';
import IconAttachment from '@icon/attachment.svg';
import IconGlobe from '@icon/globe.svg';
import IconStar from '@icon/star.svg';
import IconXmark from '@icon/xmark.svg';
import Button from '../ui/Button';

const FEED_ADDRESS = '0x469CB8F8A424fc9E1781FB2633822102134191d1';
const CREATORS_FEED_ADDRESS = '0xdd48E53Db6E53682C2f9b01d29460462e84a9354';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; file: File; type: 'image' | 'file' }[]>([]);
  const [previewUrls, setPreviewUrls] = useState<{ id: string; url: string }[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        const client = await getLensClient();
        if (!client.isSessionClient()) return;

        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) return;

        const acc = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
        setAuthor(acc);

        // Check if user is creator
        const creatorStatus = acc?.metadata?.attributes?.find((attr) => attr.key === 'isCreator')?.value === 'true';
        setIsCreator(creatorStatus || false);
      } catch (error) {
        console.error('Failed to load account:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: { id: string; file: File; type: 'image' | 'file' }[] = [];
    const newPreviews: { id: string; url: string }[] = [];

    Array.from(files).forEach((file) => {
      const id = Math.random().toString(36).substring(2);
      newFiles.push({ id, file, type });

      if (type === 'image') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls((prev) => [...prev, { id, url: reader.result as string }]);
        };
        reader.readAsDataURL(file);
      }
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    setPreviewUrls((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      const client = await getLensClient();
      if (!client.isSessionClient()) return;
      const storageClient = StorageClient.create();

      // Check if user is creator
      const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
      if (!authenticatedUser) return;

      const account = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
      const isCreator = account?.metadata?.attributes?.find((attr) => attr.key === 'isCreator')?.value === 'true';

      // Upload images and files, collect their URIs
      const imageMetas = [];
      const fileMetas = [];
      const acl = immutable(37111); // Using the chain ID for Lens Protocol

      for (const fileObj of uploadedFiles) {
        const { file, type } = fileObj;
        const upload = await storageClient.uploadFile(file, { acl });
        if (type === 'image') {
          // Detect mime type for image
          let mimeType: MediaImageMimeType = MediaImageMimeType.PNG;
          if (file.type === 'image/jpeg') mimeType = MediaImageMimeType.JPEG;
          else if (file.type === 'image/png') mimeType = MediaImageMimeType.PNG;
          else if (file.type === 'image/gif') mimeType = MediaImageMimeType.GIF;
          else if (file.type === 'image/webp') mimeType = MediaImageMimeType.WEBP;
          else if (file.type === 'image/bmp') mimeType = MediaImageMimeType.BMP;
          else if (file.type === 'image/svg+xml') mimeType = MediaImageMimeType.SVG_XML;
          else if (file.type === 'image/tiff') mimeType = MediaImageMimeType.TIFF;
          else if (file.type === 'image/heic') mimeType = MediaImageMimeType.HEIC;
          else if (file.type === 'image/x-ms-bmp') mimeType = MediaImageMimeType.X_MS_BMP;
          imageMetas.push({
            item: upload.uri,
            type: mimeType,
            altTag: file.name,
            license: MetadataLicenseType.CCO,
          });
        } else {
          // For non-image files, treat as generic attachment (no 'type' field)
          fileMetas.push({
            item: upload.uri,
            altTag: file.name,
            license: MetadataLicenseType.CCO,
          });
        }
      }
      // Create metadata
      let metadata;
      if (imageMetas.length > 0 || fileMetas.length > 0) {
        metadata = image({
          title: content.slice(0, 32),
          image: imageMetas[0] || undefined,
          attachments: fileMetas.length > 0 ? (fileMetas as any) : undefined,
          content,
          attributes: [
            {
              key: 'isPrivate',
              type: MetadataAttributeType.BOOLEAN,
              value: isPrivate ? 'true' : 'false',
            },
          ],
        });
      } else {
        metadata = textOnly({
          content,
          attributes: [
            {
              key: 'isPrivate',
              type: MetadataAttributeType.BOOLEAN,
              value: isPrivate ? 'true' : 'false',
            },
          ],
        });
      }

      // Upload metadata to Grove
      const { uri: contentUri } = await storageClient.uploadFile(new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' }), { acl });

      // Send post to appropriate feed
      const feedAddress = isPrivate && isCreator ? CREATORS_FEED_ADDRESS : FEED_ADDRESS;

      const result = await lensPost(client, {
        contentUri: uri(contentUri),
        feed: evmAddress(feedAddress),
      });

      if (result.isErr()) {
        alert(result.error.message || 'Error posting');
        return;
      }

      setContent('');
      setUploadedFiles([]);
      setPreviewUrls([]);
    } catch (err: any) {
      alert(err.message || 'Unknown error');
    }
  };

  return (
    <div className="flex w-full items-start gap-4 py-6">
      <div className="aspect-square w-10 flex-none overflow-hidden rounded-full bg-neutral-300">
        <img src={author?.metadata?.picture || '/media/placeholders/profile.png'} alt="author pp" />
      </div>
      <div className="flex w-full flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 180))}
          placeholder="What's happening?"
          className="w-full resize-none overflow-y-auto border-none bg-transparent py-2 text-[18px] leading-[24px] font-medium outline-none placeholder:text-neutral-500"
          rows={Math.min(12, Math.max(1, content.split('\n').length))}
          maxLength={180}
        />

        {uploadedFiles.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-2">
            {uploadedFiles
              .filter((f) => f.type === 'image')
              .map((fileObj) => {
                const preview = previewUrls.find((p) => p.id === fileObj.id);

                if (preview) {
                  return (
                    <div key={fileObj.id} className="relative w-full rounded-[16px] bg-neutral-300">
                      <img src={preview.url} alt="Preview" className="max-h-[1000px] w-full rounded-[16px] object-cover" style={{ boxShadow: '0px 0px 0px 1px rgba(44, 45, 48, 0.05) inset' }} />
                      <button onClick={() => handleRemoveFile(fileObj.id)} className="absolute top-2 right-2 z-[99] cursor-pointer rounded-full bg-[#2C2D30]/40 p-1.5 text-neutral-100!">
                        <IconXmark />
                      </button>
                    </div>
                  );
                }
                return null;
              })}

            {uploadedFiles.filter((f) => f.type === 'file').length > 0 && (
              <div className="flex flex-row flex-wrap gap-2">
                {uploadedFiles
                  .filter((f) => f.type === 'file')
                  .map((fileObj) => (
                    <div key={fileObj.id} className="flex max-w-[calc(50%-8px)] items-center gap-2 rounded-[16px] border border-neutral-200 bg-neutral-100 px-3 py-2 font-medium">
                      <span className="text-[16px]">
                        <IconAttachment />
                      </span>
                      <span className="truncate text-[14px]">{fileObj.file.name}</span>
                      <button onClick={() => handleRemoveFile(fileObj.id)} className="cursor-pointer">
                        <IconXmark />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-2 flex h-8 w-full items-center gap-4 text-[14px] font-medium text-neutral-600">
          <input type="file" ref={imageInputRef} accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} className="hidden" multiple />
          <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'file')} className="hidden" multiple />
          <button
            onClick={() => imageInputRef.current?.click()}
            className="cursor-pointer items-center gap-1 p-0.5 text-[20px] transition duration-200 ease-out hover:text-neutral-700 active:scale-[96%]">
            <IconPhoto />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer items-center gap-1 p-0.5 text-[20px] transition duration-200 ease-out hover:text-neutral-700 active:scale-[96%]">
            <IconAttachment />
          </button>
          {isCreator && (
            <button
              className={`ml-auto flex h-full cursor-pointer items-center gap-1 rounded text-[16px] leading-[24px] transition duration-200 ease-out hover:bg-neutral-100 active:scale-[98%] ${isPrivate ? 'text-purple' : 'text-blue'}`}
              onClick={() => setIsPrivate(!isPrivate)}>
              {isPrivate ? (
                <>
                  <IconStar /> Subscribers
                </>
              ) : (
                <>
                  <IconGlobe /> Public
                </>
              )}
            </button>
          )}
          <Button size="small" className={`${content ? 'bg-neutral-800' : 'pointer-events-none! cursor-not-allowed! bg-neutral-300'} ${!isCreator && 'ml-auto'}`} onClick={handleSubmit}>
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
