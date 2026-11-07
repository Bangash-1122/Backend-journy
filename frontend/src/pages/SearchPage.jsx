import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/useSearch';
import { DURATION_FILTERS, SEARCH_TYPES, SORT_OPTIONS } from '@/lib/constants';
import Chip from '@/components/ui/Chip';
import VideoGrid from '@/components/video/VideoGrid';
import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import Avatar from '@/components/ui/Avatar';
import SubscribeButton from '@/components/channel/SubscribeButton';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import { formatViews } from '@/lib/format';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const type = params.get('filter') || 'all';
  const sort = params.get('sort') || 'relevance';
  const duration = params.get('duration') || 'any';
  const debounced = useDebounce(q, 300);
  const query = useSearch({ q: debounced, type, sort, duration, enabled: debounced.length >= 2 });

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  };

  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  const videos = query.data?.videos || [];
  const channels = query.data?.channels || [];
  const playlists = query.data?.playlists || [];
  const empty = !query.isLoading && debounced.length >= 2 && !videos.length && !channels.length && !playlists.length;

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Search results {q ? `for “${q}”` : ''}</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        {SEARCH_TYPES.map((t) => (
          <Chip key={t.value} active={type === t.value} onClick={() => set('filter', t.value)}>
            {t.label}
          </Chip>
        ))}
        {SORT_OPTIONS.map((t) => (
          <Chip key={t.value} active={sort === t.value} onClick={() => set('sort', t.value)}>
            {t.label}
          </Chip>
        ))}
        {DURATION_FILTERS.map((t) => (
          <Chip key={t.value} active={duration === t.value} onClick={() => set('duration', t.value)}>
            {t.label}
          </Chip>
        ))}
      </div>
      {debounced.length < 2 ? (
        <p className="text-sm text-muted">Type at least 2 characters to search.</p>
      ) : null}
      {channels.map((channel) => (
        <div key={channel.id} className="mb-4 flex items-center gap-4 rounded-xl border border-border p-4">
          <Avatar src={channel.avatar} name={channel.fullName} size={80} />
          <div className="flex-1">
            <p className="text-lg font-semibold">{channel.fullName}</p>
            <p className="text-sm text-muted">@{channel.username} • {formatViews(channel.subscribersCount)} subscribers</p>
          </div>
          <SubscribeButton channelId={channel.id} subscribed={channel.isSubscribed} />
        </div>
      ))}
      {playlists.length ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((p) => (
            <PlaylistCard key={p.id} playlist={p} />
          ))}
        </div>
      ) : null}
      <VideoGrid videos={videos} loading={query.isLoading} />
      {empty ? (
        <EmptyState icon={Search} title={`No results for “${q}”`} description="Try different keywords." />
      ) : null}
    </div>
  );
}
