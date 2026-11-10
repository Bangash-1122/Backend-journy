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
    onMutate: async (channelId) => {
      await qc.cancelQueries({ queryKey: ['channels'] });
      await qc.cancelQueries({ queryKey: ['videos'] });

      const previousChannels = qc.getQueriesData({ queryKey: ['channels', 'detail'] });
      const previousVideos = qc.getQueriesData({ queryKey: ['videos', 'detail'] });

      // Optimistically update channel details
      qc.setQueriesData({ queryKey: ['channels', 'detail'] }, (old) => {
        if (!old) return old;
        if (old.id === channelId || old._id === channelId) {
          const nextSub = !old.isSubscribed;
          return {
            ...old,
            isSubscribed: nextSub,
            subscribersCount: Math.max(0, (old.subscribersCount || 0) + (nextSub ? 1 : -1)),
          };
        }
        return old;
      });

      // Optimistically update video owner if matches channel
      qc.setQueriesData({ queryKey: ['videos', 'detail'] }, (old) => {
        if (!old?.owner) return old;
        if (old.owner.id === channelId || old.owner._id === channelId) {
          return {
            ...old,
            owner: {
              ...old.owner,
              isSubscribed: !old.owner.isSubscribed,
            },
          };
        }
        return old;
      });

      return { previousChannels, previousVideos };
    },
    onError: (_err, _channelId, context) => {
      if (context?.previousChannels) {
        context.previousChannels.forEach(([key, data]) => qc.setQueryData(key, data));
      }
      if (context?.previousVideos) {
        context.previousVideos.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.channels.all });
      qc.invalidateQueries({ queryKey: ['subscriptions'] });
      qc.invalidateQueries({ queryKey: ['videos', 'detail'] });
    },
  });
}
