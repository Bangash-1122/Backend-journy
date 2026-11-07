import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getChannelByUsername, getChannelTweets, getSubscribedChannels, toggleSubscription } from '@/services/channels.service';
import { fetchVideos } from '@/services/videos.service';

export function useChannel(username) {
  return useQuery({
    queryKey: queryKeys.channels.detail(username),
    queryFn: () => getChannelByUsername(username),
    enabled: Boolean(username),
    staleTime: 5 * 60_000,
  });
}

export function useChannelVideos(userId) {
  return useQuery({
    queryKey: queryKeys.channels.videos(userId),
    queryFn: () => fetchVideos({ userId, limit: 24 }),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}

export function useChannelTweets(userId) {
  return useQuery({
    queryKey: queryKeys.channels.tweets(userId),
    queryFn: () => getChannelTweets(userId),
    enabled: Boolean(userId),
  });
}

export function useSubscribedChannels(userId) {
  return useQuery({
    queryKey: queryKeys.subscriptions.channels(userId),
    queryFn: () => getSubscribedChannels(userId),
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
