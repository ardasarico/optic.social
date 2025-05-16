'use client';

interface ContentProps {
  content: string;
  media?: Array<{
    url: string;
    type: string;
  }>;
}

const Content = ({ content, media }: ContentProps) => {
  return (
    <div className="mt-1 flex flex-col gap-1">
      {/* Text content */}
      <div className="text-[16px] leading-[24px]">{content}</div>

      {/* Media content */}
      {media && media.length > 0 && (
        <div className="">
          {media.map((item, index) => {
            if (item.type.startsWith('image')) {
              return (
                <div key={index} className="relative h-auto w-full overflow-hidden rounded-[16px]">
                  <img src={item.url} alt="Post media" className="h-full min-h-[220px] w-full object-cover" />
                </div>
              );
            } else if (item.type.startsWith('video')) {
              return (
                <div key={index} className="relative h-auto w-full overflow-hidden rounded-[16px]">
                  <video src={item.url} className="h-full min-h-[220px] w-full object-cover" />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default Content;
