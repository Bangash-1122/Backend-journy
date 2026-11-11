import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  fetchPlaylist,
  fetchUserPlaylists,
  removeVideoFromPlaylist,
} from '@/services/playlists.service';

export function usePlaylists(userId) {
  return useQuery({
    queryKey: queryKeys.playlists.mine(userId),
    queryFn: ({ signal }) => fetchUserPlaylists(userId, { signal }),
    enabled: Boolean(userId),
  });
}

export function usePlaylist(id) {
  return useQuery({
    queryKey: queryKeys.playlists.detail(id),
    queryFn: ({ signal }) => fetchPlaylist(id, { signal }),
    enabled: Boolean(id),
  });
}

export function useCreatePlaylist(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.playlists.mine(userId) }),
  });
}

export function useDeletePlaylist(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePlaylist,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.playlists.mine(userId) }),
  });
}

export function useAddToPlaylist(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, videoId }) => addVideoToPlaylist(playlistId, videoId),
    onMutate: async ({ playlistId, videoId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
      const previousPlaylist = qc.getQueryData(queryKeys.playlists.detail(playlistId));
      const videoDetail = qc.getQueryData(queryKeys.videos.detail(videoId));

      if (previousPlaylist && videoDetail) {
        qc.setQueryData(queryKeys.playlists.detail(playlistId), {
          ...previousPlaylist,
          videos: [...(previousPlaylist.videos || []), videoDetail],
        });
      }

      return { previousPlaylist, playlistId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPlaylist && context?.playlistId) {
        qc.setQueryData(queryKeys.playlists.detail(context.playlistId), context.previousPlaylist);
      }
    },
    onSettled: (_, __, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine(userId) });
      if (vars?.playlistId) {
        qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(vars.playlistId) });
      }
    },
  });
}

export function useRemoveFromPlaylist(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, videoId }) => removeVideoFromPlaylist(playlistId, videoId),
    onMutate: async ({ playlistId, videoId }) => {
      await qc.cancelQueries({ queryKey: queryKeys.playlists.detail(playlistId) });
      const previousPlaylist = qc.getQueryData(queryKeys.playlists.detail(playlistId));

      if (previousPlaylist) {
        qc.setQueryData(queryKeys.playlists.detail(playlistId), {
          ...previousPlaylist,
          videos: (previousPlaylist.videos || []).filter((v) => v.id !== videoId && v._id !== videoId),
        });
      }

      return { previousPlaylist, playlistId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPlaylist && context?.playlistId) {
        qc.setQueryData(queryKeys.playlists.detail(context.playlistId), context.previousPlaylist);
      }
    },
    onSettled: (_, __, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine(userId) });
      if (vars?.playlistId) {
        qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(vars.playlistId) });
      }
    },
  });
}
