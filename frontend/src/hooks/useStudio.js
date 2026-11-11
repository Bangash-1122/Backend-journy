import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { fetchStudioStats, fetchStudioVideos, sampleAnalytics } from '@/services/studio.service';

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

export function useStudioAnalytics(range) {
  return useQuery({
    queryKey: queryKeys.studio.analytics(range),
    queryFn: async () => ({ sample: true, points: sampleAnalytics(range) }),
  });
}
