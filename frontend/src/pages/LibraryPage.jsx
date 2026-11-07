import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { History } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { useVideos } from '@/hooks/useVideos';
import { fetchLikedVideos } from '@/services/videos.service';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { LOCAL_HISTORY_KEY, WATCH_LATER_KEY } from '@/lib/constants';
import { readJson, writeJson } from '@/lib/storage';
import VideoGrid from '@/components/video/VideoGrid';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/feedback/EmptyState';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useAuthStore } from '@/store/authStore';
import PlaylistCard from '@/components/playlist/PlaylistCard';

const tabs = [
  { id: 'history', label: 'History' },
  { id: 'later', label: 'Watch later' },
  { id: 'liked', label: 'Liked videos' },
  { id: 'playlists', label: 'Your playlists' },
];

export default function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'history';
  const user = useAuthStore((s) => s.user);
  const all = useVideos({ limit: 24 });
  const videos = all.data?.pages.flatMap((p) => p.items) ?? [];
  const historyIds = readJson(LOCAL_HISTORY_KEY, []);
  const laterIds = readJson(WATCH_LATER_KEY, []);
  const liked = useQuery({ queryKey: queryKeys.library.liked, queryFn: fetchLikedVideos });
  const playlists = usePlaylists(user?.id);

  const history = historyIds.map((id) => videos.find((v) => v.id === id)).filter(Boolean);
  const later = laterIds.map((id) => videos.find((v) => v.id === id)).filter(Boolean);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Library</h1>
        {tab === 'history' ? (
          <Button
            variant="secondary"
            onClick={async () => {
              if (await confirmDelete({ title: 'Clear watch history?', text: 'This cannot be undone.' })) {
                writeJson(LOCAL_HISTORY_KEY, []);
                toast.success('History cleared');
                setParams({ tab: 'history' });
              }
            }}
          >
            Clear history
          </Button>
        ) : null}
      </div>
      <Tabs tabs={tabs} value={tab} onChange={(id) => setParams({ tab: id })} />
      <div className="mt-6">
        {tab === 'history' ? (
          history.length ? <VideoGrid videos={history} /> : <EmptyState icon={History} title="No watch history" description="Videos you watch will appear here." />
        ) : null}
        {tab === 'later' ? <VideoGrid videos={later} loading={all.isLoading} /> : null}
        {tab === 'liked' ? <VideoGrid videos={liked.data || []} loading={liked.isLoading} /> : null}
        {tab === 'playlists' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(playlists.data || []).map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
