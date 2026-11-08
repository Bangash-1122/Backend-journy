import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getChannelByUsername, getChannelTweets, getSubscribedChannels, toggleSubscription } from '@/services/channels.service';
import { fetchVideos } from '@/services/videos.service';

export function useChannel(username) {
  return useQuery({
    queryKey: queryKeys.channels.detail(username),
    queryFn: ({ signal }) => getChannelByUsername(username, { signal }),
    enabled: Boolean(username),
    staleTime: 5 * 60_000,
  });
}

export function useChannelVideos(userId) {
  return useQuery({
    queryKey: queryKeys.channels.videos(userId),
    queryFn: ({ signal }) => fetchVideos({ userId, limit: 24, signal }),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export function useChannelTweets(userId) {
  return useQuery({
    queryKey: queryKeys.channels.tweets(userId),
    queryFn: ({ signal }) => getChannelTweets(userId, { signal }),
    enabled: Boolean(userId),
  });
}

export function useSubscribedChannels(userId) {
  return useQuery({
    queryKey: queryKeys.subscriptions.channels(userId),
    queryFn: ({ signal }) => getSubscribedChannels(userId, { signal }),
    enabled: Boolean(userId),
  });
}

export function useToggleSubscribe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleSubscription,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.channels.all });
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}
