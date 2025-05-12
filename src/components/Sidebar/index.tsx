import Image from 'next/image';
import Pages from './Pages';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className={'flex h-full w-[256px]! flex-none flex-col items-center gap-3 bg-neutral-100 px-3 pt-4 pb-6 shadow-[-1px_0px_0px_0px_#ECEEF0_inset]'}>
      <div className={'flex w-full px-3 py-2'}>
        <Image src={'/logo-with-text.svg'} height={40} width={84} alt={'logo'} />
      </div>
      <Pages />
      <div className={'mt-auto flex items-center gap-2 text-[13px] leading-[16px] text-neutral-600'}>
        <p>© 2025 Optic</p>
        <p className={'text-neutral-500'}>·</p>
        <Link href="https://github.com/" target={'_blank'} className={'transition duration-200 ease-out hover:text-neutral-800'}>
          GitHub
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
