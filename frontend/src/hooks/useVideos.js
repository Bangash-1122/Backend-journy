import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  deleteVideo,
  fetchRelatedVideos,
  fetchRecommendedVideos,
  fetchShorts,
  fetchVideoById,
  fetchVideos,
  togglePublish,
  toggleVideoLike,
  updateVideo,
} from '@/services/videos.service';

export function useVideos(filters) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.list(filters),
    queryFn: ({ pageParam = 1, signal }) => fetchVideos({ ...filters, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.pagination?.hasMore ? last.pagination.page + 1 : undefined),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useShorts(filters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.shorts(filters),
    queryFn: ({ pageParam = 1, signal }) => fetchShorts({ ...filters, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.pagination?.hasMore ? last.pagination.page + 1 : undefined),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useRecommendedVideos(filters = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.recommendations(filters),
    queryFn: ({ pageParam = 1, signal }) => fetchRecommendedVideos({ ...filters, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last?.pagination?.hasMore ? last.pagination.page + 1 : undefined),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useRelatedVideos(videoId, options = {}) {
  return useQuery({
    queryKey: queryKeys.videos.related(videoId),
    queryFn: ({ signal }) => fetchRelatedVideos(videoId, { ...options, signal }),
    enabled: Boolean(videoId),
    staleTime: 60_000,
  });
}

export function useVideo(id) {
  return useQuery({
    queryKey: queryKeys.videos.detail(id),
    queryFn: ({ signal }) => fetchVideoById(id, { signal }),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleVideoLike,
    onMutate: async (id) => {
      if (!id) return;
      // Cancel queries so they don't overwrite optimistic update
      await qc.cancelQueries({ queryKey: queryKeys.videos.detail(id) });
      const previousDetail = qc.getQueryData(queryKeys.videos.detail(id));

      if (previousDetail) {
        const nextLiked = !previousDetail.isLiked;
        qc.setQueryData(queryKeys.videos.detail(id), {
          ...previousDetail,
          isLiked: nextLiked,
          likes: Math.max(0, (previousDetail.likes || 0) + (nextLiked ? 1 : -1)),
        });
      }

      // Also optimistically update inside shorts queries if cached
      const previousShorts = qc.getQueriesData({ queryKey: ['videos', 'shorts'] });
      qc.setQueriesData({ queryKey: ['videos', 'shorts'] }, (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: (page.items || []).map((item) =>
              item.id === id
                ? {
                    ...item,
                    isLiked: !item.isLiked,
                    likes: Math.max(0, (item.likes || 0) + (!item.isLiked ? 1 : -1)),
                  }
                : item,
            ),
          })),
        };
      });

      return { previousDetail, previousShorts, id };
    },
    onError: (_err, _id, context) => {
      if (context?.previousDetail && context?.id) {
        qc.setQueryData(queryKeys.videos.detail(context.id), context.previousDetail);
      }
      if (context?.previousShorts) {
        context.previousShorts.forEach(([key, data]) => {
          qc.setQueryData(key, data);
        });
      }
    },
    onSettled: (_, __, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.videos.all });
      if (id) qc.invalidateQueries({ queryKey: queryKeys.videos.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.library.liked });
    },
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.videos.all });
      qc.invalidateQueries({ queryKey: queryKeys.studio.videos() });
    },
  });
}

export function useUpdateVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateVideo(id, payload),
    onSuccess: (video) => {
      qc.invalidateQueries({ queryKey: queryKeys.videos.detail(video.id) });
      qc.invalidateQueries({ queryKey: queryKeys.studio.videos() });
    },
  });
}

export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: togglePublish,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.studio.videos() }),
  });
}
