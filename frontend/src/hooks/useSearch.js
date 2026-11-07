import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchVideos } from '@/services/videos.service';
import { getChannelByUsername } from '@/services/channels.service';
import { fetchUserPlaylists } from '@/services/playlists.service';
import { useAuthStore } from '@/store/authStore';

export function useSearch({ q, type, sort, duration, enabled }) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: queryKeys.videos.search({ q, type, sort, duration }),
    enabled: Boolean(enabled && q && q.length >= 2),
    staleTime: 60_000,
    queryFn: async ({ signal }) => {
      const sortBy = sort === 'views' ? 'views' : sort === 'date' ? 'createdAt' : undefined;
      const videos = await fetchVideos({ query: q, page: 1, limit: 24, sortBy, sortType: 'desc', signal });
      let items = videos.items;
      if (duration === 'short') items = items.filter((v) => v.duration < 240);
      if (duration === 'medium') items = items.filter((v) => v.duration >= 240 && v.duration <= 1200);
      if (duration === 'long') items = items.filter((v) => v.duration > 1200);

      let channels = [];
      let playlists = [];
      if (type === 'all' || type === 'channel') {
        try {
          const channel = await getChannelByUsername(q.replace(/\s+/g, '').toLowerCase());
          if (channel) channels = [channel];
        } catch {
          channels = [];
        }
      }
      if ((type === 'all' || type === 'playlist') && userId) {
        const all = await fetchUserPlaylists(userId);
        playlists = all.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
      }
      return { videos: type === 'channel' || type === 'playlist' ? [] : items, channels, playlists };
    },
  });
}
