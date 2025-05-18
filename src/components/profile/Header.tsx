import Button from '@/components/ui/Button';
import IconStar from '@icon/star.svg';

interface HeaderProps {
  name: string;
  handle: string;
  bio?: string;
  profileImage: string;
  coverImage?: string;
  followerCount?: number;
  followingCount?: number;
}

const Header = ({ name, handle, bio, profileImage, followerCount, followingCount }: HeaderProps) => {
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
          <span className="font-semibold text-neutral-800">{followerCount ?? 0} </span> Followers
        </span>
        <p className={'font-semibold text-neutral-500'}>·</p>
        <span>
          <span className="font-semibold text-neutral-800">{followingCount ?? 0} </span> Followers
        </span>
      </div>
      <div className="flex w-full items-center gap-2">
        <Button size="large" fill>
          Follow
        </Button>
        <Button className="bg-purple/10 text-purple" size="large" fill>
          <IconStar />
          Subscribe
        </Button>
      </div>
    </div>
  );
};

export default Header;
