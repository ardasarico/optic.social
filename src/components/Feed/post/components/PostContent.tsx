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
            // Accept both 'image/png' and 'PNG' (and similar) as image types
            const typeLower = item.type.toLowerCase();
            if (
              typeLower.startsWith('image') ||
              ['png', 'jpeg', 'jpg', 'gif', 'webp', 'bmp', 'svg+xml', 'tiff', 'heic', 'x-ms-bmp'].includes(typeLower) ||
              ['png', 'jpeg', 'jpg', 'gif', 'webp', 'bmp', 'svg_xml', 'tiff', 'heic', 'x_ms_bmp'].includes(typeLower.replace(/\W/g, '_'))
            ) {
              return (
                <div key={index} className="relative h-auto w-full overflow-hidden rounded-[16px]">
                  <img src={item.url} alt="Post media" className="h-full min-h-[220px] w-full object-cover" />
                </div>
              );
            } else if (typeLower.startsWith('video')) {
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
