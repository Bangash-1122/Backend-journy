import { useSearchParams } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useVideos } from '@/hooks/useVideos';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CategoryChips from '@/components/layout/CategoryChips';
import VideoGrid from '@/components/video/VideoGrid';
import HeroCarousel from '@/components/home/HeroCarousel';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'All';
  const isMobile = useMediaQuery('(max-width: 639px)');
  const query = useVideos({ limit: 12 });
  const videos = query.data?.pages.flatMap((p) => p.items) ?? [];
  const filtered = category === 'All' ? videos : videos.filter((v) => v.category === category);
  const sentinel = useInfiniteScroll(() => query.fetchNextPage(), isMobile && query.hasNextPage && !query.isFetchingNextPage);

  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  return (
    <div>
      <HeroCarousel videos={videos} />
      <CategoryChips value={category} onChange={(next) => setParams(next === 'All' ? {} : { category: next })} />
      {!query.isLoading && filtered.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="No videos yet"
          description="Upload your first video to fill the home feed."
          actionLabel="Upload your first video"
          onAction={() => (window.location.href = '/upload')}
        />
      ) : (
        <VideoGrid videos={filtered} loading={query.isLoading} />
      )}
      {query.hasNextPage ? (
        <div ref={sentinel} className="mt-6 flex justify-center">
          {isMobile ? null : (
            <Button variant="secondary" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
              Load more
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
