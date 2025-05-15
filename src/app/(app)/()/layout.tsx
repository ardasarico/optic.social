import Sidebar from '@/components/Sidebar';
import PageHeader from '@/components/PageHeader';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={'flex h-screen min-h-[800px] w-full items-start'}>
      <Sidebar />
      <div className={'flex h-full w-full flex-col items-center'}>
        <PageHeader />
        <div className={'hide-scrollbar w-full overflow-x-hidden overflow-y-scroll pb-32'}>
          <div className={'relative mx-auto flex w-[472px] flex-col items-center gap-3 pt-3'}>{children}</div>
        </div>
      </div>
    </div>
  );
}
