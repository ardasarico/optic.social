'use client';

interface PostSkeletonProps {
  count?: number;
}

const PostSkeleton = ({ count = 3 }: PostSkeletonProps) => {
  return (
    <div className="flex w-full flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex w-full items-start gap-4 py-6 shadow-[0px_2px_0px_0px_#F8F9FA_inset]">
          {/* Profile Picture */}
          <div className="aspect-square w-10 flex-none animate-pulse overflow-hidden rounded-full bg-neutral-200" />

          <div className="flex w-full flex-col gap-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
              <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* Image Placeholder */}
            <div className="mt-2 h-48 w-full animate-pulse rounded-[16px] bg-neutral-200" />

            {/* Actions */}
            <div className="mt-2 flex items-center gap-6">
              <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
              <div className="ml-auto h-5 w-8 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostSkeleton;
