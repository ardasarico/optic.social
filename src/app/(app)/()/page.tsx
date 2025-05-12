import 'server-only';

import Image from 'next/image';
import Link from 'next/link';

import Test from '@icon/test.svg';

export default function Home() {
  return (
    <div className={'flex flex-col leading-none gap-12 p-32'}>
      <div className={'flex items-center gap-6'}>
        <Link href={'/login'}>Login</Link>
        <Link href={'/becomecreator'}>Become Creator</Link>
      </div>
      <div className={'flex items-center gap-3'}>
        <Image src={'/logo.svg'} alt={'logo'} width={52} height={52} />
        <p className={'font-openrunde text-4xl font-semibold'}>optic</p>
      </div>
      <div>
        <div className={'text-[120px]'}>Inter</div>
        <div className={'text-[64px] font-openrunde font-semibold'}>Open Runde</div>
      </div>
      <Test className={'text-[16px]'} />
    </div>
  );
}
