import Skeleton from '@/components/ui/Skeleton';

export default function VideoSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="size-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
