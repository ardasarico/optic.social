import Sidebar from '@/components/Sidebar';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={'flex h-screen w-screen overflow-hidden'}>
      <Sidebar />
      <div className={'h-full w-full overflow-x-hidden overflow-y-scroll'}>{children}</div>
    </div>
  );
}
