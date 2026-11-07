import { useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { confirmDelete } from '@/lib/confirm';
import { useAuthStore } from '@/store/authStore';
import { usePlaylist, useRemoveFromPlaylist } from '@/hooks/usePlaylists';
import VideoPlayer from '@/components/video/VideoPlayer';
import PlaylistRow from '@/components/playlist/PlaylistRow';
import ErrorState from '@/components/feedback/ErrorState';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

export default function PlaylistDetailPage() {
  const { playlistId } = useParams();
  const [params, setParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const query = usePlaylist(playlistId);
  const remove = useRemoveFromPlaylist(user?.id);
  const playlist = query.data;
  const currentId = params.get('v') || playlist?.videos?.[0]?.id;
  const current = playlist?.videos?.find((v) => v.id === currentId) || playlist?.videos?.[0];

  if (query.isLoading) return <Skeleton className="h-64" />;
  if (query.isError || !playlist) return <ErrorState error={query.error} onRetry={query.refetch} />;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        {current?.videoFile ? <VideoPlayer key={current.id} src={current.videoFile} poster={current.thumbnail} /> : <div className="aspect-video rounded-xl bg-surface" />}
        <h1 className="mt-4 text-2xl font-bold">{playlist.name}</h1>
        <p className="text-sm text-muted">{playlist.description}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={() => toast.success('Link copied')}>
            Share
          </Button>
        </div>
      </div>
      <div className="w-full overflow-hidden rounded-xl border border-border lg:w-[420px]">
        {(playlist.videos || []).map((video, i) => (
          <div key={video.id || i} onClick={() => setParams({ v: video.id })}>
            <PlaylistRow
              video={video}
              index={i}
              active={video.id === current?.id}
              onRemove={async (id) => {
                if (await confirmDelete({ title: 'Remove this video?', text: 'It will leave the playlist.' })) {
                  await remove.mutateAsync({ playlistId, videoId: id });
                  toast.success('Removed from playlist');
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
