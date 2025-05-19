'use client';

import Button from '@/components/ui/Button';
import IconStar from '@icon/star.svg';
import IconPencil from '@icon/pencil.svg';
import IconGear from '@icon/gear.svg';
import { useEffect, useState } from 'react';
import { getLensClient } from '@/lib/lens/client';
import { follow, unfollow, fetchAccount } from '@lens-protocol/client/actions';
import { handleOperationWith } from '@lens-protocol/client/viem';
import { useWalletClient } from 'wagmi';
import { evmAddress as createEvmAddress } from '@lens-protocol/client';

interface HeaderProps {
  name: string;
  handle: string;
  bio?: string;
  profileImage: string;
  followerCount?: number;
  followingCount?: number;
  evmAddress?: string;
}

const Header = ({ name, handle, bio, profileImage, followerCount = 0, followingCount, evmAddress }: HeaderProps) => {
  const [followState, setFollowState] = useState<'not_following' | 'following' | 'follow_back'>('not_following');
  const [currentFollowerCount, setCurrentFollowerCount] = useState(followerCount);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const { data: walletClient } = useWalletClient();

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

        const iAmFollowing = targetAccount.operations?.isFollowedByMe ?? false;
        const theyAreFollowingMe = myAccount.operations?.isFollowedByMe ?? false;

        if (iAmFollowing) {
          setFollowState('following');
        } else if (theyAreFollowingMe) {
          setFollowState('follow_back');
        } else {
          setFollowState('not_following');
        }
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
          <Button size="large" fill className="bg-neutral-200 text-neutral-800 hover:bg-neutral-300">
            <IconPencil />
            Edit Profile
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
        <Button className="bg-purple/10 text-purple" size="large" fill>
          <IconStar />
          Subscribe
        </Button>
      </>
    );
  };

  return (
    <div className="mt-8 flex w-full flex-col items-center justify-center gap-6">
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
