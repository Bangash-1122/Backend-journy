import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { deleteVideo, fetchVideoById, fetchVideos, togglePublish, toggleVideoLike, updateVideo } from '@/services/videos.service';

export function useVideos(filters) {
  return useInfiniteQuery({
    queryKey: queryKeys.videos.list(filters),
    queryFn: ({ pageParam = 1, signal }) => fetchVideos({ ...filters, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.hasMore ? last.pagination.page + 1 : undefined),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useVideo(id) {
  return useQuery({
    queryKey: queryKeys.videos.detail(id),
    queryFn: () => fetchVideoById(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleVideoLike,
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.videos.all }),
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
