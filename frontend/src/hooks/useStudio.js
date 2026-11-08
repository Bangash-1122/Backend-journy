import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchStudioAnalytics, fetchStudioStats, fetchStudioVideos } from '@/services/studio.service';

export function useStudioStats(channelId) {
  return useQuery({
    queryKey: queryKeys.studio.stats(channelId),
    queryFn: ({ signal }) => fetchStudioStats(channelId, { signal }),
    enabled: Boolean(channelId),
  });
}

export function useStudioVideos(channelId) {
  return useQuery({
    queryKey: queryKeys.studio.videos(channelId),
    queryFn: ({ signal }) => fetchStudioVideos(channelId, { signal }),
    enabled: Boolean(channelId),
  });
}

export function useStudioAnalytics(range, channelId) {
  return useQuery({
    queryKey: queryKeys.studio.analytics(range),
    queryFn: ({ signal }) => fetchStudioAnalytics(channelId, range, { signal }),
  });
}
