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
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(vars.playlistId) });
    },
  });
}

export function useRemoveFromPlaylist(userId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, videoId }) => removeVideoFromPlaylist(playlistId, videoId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.playlists.mine(userId) });
      qc.invalidateQueries({ queryKey: queryKeys.playlists.detail(vars.playlistId) });
    },
  });
}
