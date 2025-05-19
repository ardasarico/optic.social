import Header from '@/components/profile/Header';
import { fetchAccount, fetchFollowers, fetchFollowing } from '@lens-protocol/client/actions';
import { getLensClient } from '@/lib/lens/client';
import { evmAddress } from '@lens-protocol/client';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lensClient = await getLensClient();

  const result = await fetchAccount(lensClient, {
    username: {
      localName: slug,
    },
  });

  if (result.isErr() || !result.value) {
    return <div>Profile not found</div>;
  }

  const account = result.value;
  const address = account.address;
  if (!address) {
    return <div className="bg-neutral-400 py-32">Profile not found</div>;
  }

  const [followersResult, followingResult] = await Promise.all([fetchFollowers(lensClient, { account: evmAddress(address) }), fetchFollowing(lensClient, { account: evmAddress(address) })]);

  const followerCount = followersResult.isOk() ? followersResult.value.items.length : 0;
  const followingCount = followingResult.isOk() ? followingResult.value.items.length : 0;

  return (
    <Header
      name={account.metadata?.name ?? ''}
      handle={account.username?.localName ?? ''}
      bio={account.metadata?.bio ?? ''}
      profileImage={account.metadata?.picture ?? '/media/placeholders/profile.png'}
      evmAddress={account.address ?? ''}
      followerCount={followerCount}
      followingCount={followingCount}
    />
  );
}
