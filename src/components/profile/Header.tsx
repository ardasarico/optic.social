'use client';

import Button from '@/components/ui/Button';
import IconStar from '@icon/star.svg';
import IconPencil from '@icon/pencil.svg';
import IconGear from '@icon/gear.svg';
import { useEffect, useState } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { follow, unfollow, fetchAccount, setAccountMetadata } from '@lens-protocol/client/actions';
import { handleOperationWith } from '@lens-protocol/client/viem';
import { useWalletClient } from 'wagmi';
import { evmAddress as createEvmAddress, uri } from '@lens-protocol/client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  name: string;
  handle: string;
  bio?: string;
  profileImage: string;
  followerCount?: number;
  followingCount?: number;
  evmAddress?: string;
  onSubscriptionChange?: (isSubscribed: boolean) => void;
}

const Header = ({ name, handle, bio, profileImage, followerCount = 0, followingCount, evmAddress, onSubscriptionChange }: HeaderProps) => {
  const [followState, setFollowState] = useState<'not_following' | 'following' | 'follow_back'>('not_following');
  const [currentFollowerCount, setCurrentFollowerCount] = useState(followerCount);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { data: walletClient } = useWalletClient();
  const router = useRouter();

  useEffect(() => {
    setCurrentFollowerCount(followerCount);
  }, [followerCount]);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const client = await getLensClient();
        if (!client.isSessionClient()) return;

        const authenticatedUser = client.getAuthenticatedUser().unwrapOr(null);
        if (!authenticatedUser) return;

        const myAccount = await fetchAccount(client, { address: authenticatedUser.address }).unwrapOr(null);
        if (!myAccount) return;

        if (evmAddress && myAccount.address.toLowerCase() === evmAddress.toLowerCase()) {
          setIsOwnProfile(true);
          return;
        }

        const targetAccount = await fetchAccount(client, { address: evmAddress! }).unwrapOr(null);
        if (!targetAccount) return;

        // Check if target account is a creator
        const creatorStatus = targetAccount.metadata?.attributes?.find((attr) => attr.key === 'isCreator')?.value === 'true';
        setIsCreator(creatorStatus || false);

        // Check subscription status from localStorage
        const subscriptions = localStorage.getItem('subscriptions');
        if (subscriptions) {
          try {
            const subscribedTo = JSON.parse(subscriptions);
            setIsSubscribed(subscribedTo.includes(evmAddress));
          } catch {
            setIsSubscribed(false);
          }
        }

        const iAmFollowing = targetAccount.operations?.isFollowedByMe ?? false;
        const theyAreFollowingMe = myAccount.operations?.isFollowedByMe ?? false;

        setFollowState(iAmFollowing ? 'following' : theyAreFollowingMe ? 'follow_back' : 'not_following');
      } catch (error) {
        console.error('Error checking profile status:', error);
      }
    };

    if (evmAddress) {
      checkProfile();
    }
  }, [evmAddress]);

  const handleFollow = async () => {
    if (!walletClient || !evmAddress) return;

    try {
      const client = await getLensClient();
      if (!client.isSessionClient()) return;

      const isFollowing = followState === 'following';
      const newState = isFollowing ? 'not_following' : 'following';
      const newFollowerCount = isFollowing ? currentFollowerCount - 1 : currentFollowerCount + 1;

      setFollowState(newState);
      setCurrentFollowerCount(newFollowerCount);

      if (isFollowing) {
        await unfollow(client, {
          account: createEvmAddress(evmAddress),
        }).andThen(handleOperationWith(walletClient));
      } else {
        await follow(client, {
          account: createEvmAddress(evmAddress),
        }).andThen(handleOperationWith(walletClient));
      }
    } catch (error) {
      const isFollowing = followState === 'following';
      setFollowState(followState);
      setCurrentFollowerCount(currentFollowerCount);
      console.error('Error following/unfollowing:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!walletClient || !evmAddress) return;

    const newSubscriptionState = !isSubscribed;
    const needsToFollow = newSubscriptionState && followState !== 'following';
    const previousFollowState = followState;
    const previousFollowerCount = currentFollowerCount;

    try {
      const client = await getLensClient();
      if (!client.isSessionClient()) {
        alert('Please connect your wallet first');
        return;
      }

      // Optimistically update UI
      setIsSubscribed(newSubscriptionState);
      if (needsToFollow) {
        setFollowState('following');
        setCurrentFollowerCount(previousFollowerCount + 1);
      }
      onSubscriptionChange?.(newSubscriptionState);

      // Get current subscriptions from localStorage
      let currentSubscriptions = [];
      const subscriptions = localStorage.getItem('subscriptions');
      if (subscriptions) {
        try {
          currentSubscriptions = JSON.parse(subscriptions);
        } catch {
          currentSubscriptions = [];
        }
      }

      // Add or remove subscription
      if (newSubscriptionState) {
        if (!currentSubscriptions.includes(evmAddress)) {
          currentSubscriptions.push(evmAddress);
        }
      } else {
        currentSubscriptions = currentSubscriptions.filter((addr: string) => addr !== evmAddress);
      }

      // Save to localStorage
      localStorage.setItem('subscriptions', JSON.stringify(currentSubscriptions));

      // Handle Lens follow operations if needed
      if (newSubscriptionState && needsToFollow) {
        await follow(client, {
          account: createEvmAddress(evmAddress),
        }).andThen(handleOperationWith(walletClient));
      }
    } catch (error: any) {
      // Revert UI state on error
      setIsSubscribed(!newSubscriptionState);
      if (needsToFollow) {
        setFollowState(previousFollowState);
        setCurrentFollowerCount(previousFollowerCount);
      }
      onSubscriptionChange?.(!newSubscriptionState);
      alert(error.message || `Failed to ${newSubscriptionState ? 'subscribe' : 'unsubscribe'}`);
    }
  };

  const getFollowButtonText = () => {
    switch (followState) {
      case 'following':
        return 'Following';
      case 'follow_back':
        return 'Follow Back';
      default:
        return 'Follow';
    }
  };

  const renderActionButtons = () => {
    if (isOwnProfile) {
      return (
        <>
          <Button size="large" fill className="bg-neutral-200 text-neutral-800 hover:bg-neutral-300" onClick={() => router.push(`/${handle}/settings`)}>
            <IconPencil />
            Edit Details
          </Button>
          <Button size="large" fill className="bg-neutral-200 text-neutral-800 hover:bg-neutral-300">
            <IconGear />
            Settings
          </Button>
        </>
      );
    }

    return (
      <>
        <Button size="large" fill onClick={handleFollow} className={followState === 'following' ? 'bg-neutral-300 text-neutral-800' : ''}>
          {getFollowButtonText()}
        </Button>
        {isCreator && (
          <Button className={`${isSubscribed ? 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300' : 'bg-purple/10 text-purple hover:bg-purple/20'}`} size="large" fill onClick={handleSubscribe}>
            <IconStar />
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        )}
      </>
    );
  };

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-6 pb-8">
      <img src={profileImage} alt="Profile" className="aspect-square w-[112px] overflow-hidden rounded-full bg-neutral-300 object-cover" />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-[28px] leading-[32px] font-semibold">{name}</p>
        <p className="text-[18px] leading-[24px] font-medium text-neutral-600">@{handle}</p>
      </div>

      {bio && <p>{bio}</p>}
      <div className="flex items-center gap-2 font-medium text-neutral-600">
        <span>
          <span className="font-semibold text-neutral-800">{followingCount ?? 0} </span> Following
        </span>
        <p className={'font-semibold text-neutral-400'}>·</p>
        <span>
          <span className="font-semibold text-neutral-800">{currentFollowerCount} </span> Followers
        </span>
      </div>
      <div className="flex w-full items-center gap-2">{renderActionButtons()}</div>
    </div>
  );
};

export default Header;
