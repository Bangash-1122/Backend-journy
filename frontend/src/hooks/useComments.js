import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { addComment, deleteComment, fetchComments } from '@/services/comments.service';

export function useComments(videoId) {
  return useQuery({
    queryKey: queryKeys.comments.list(videoId),
    queryFn: () => fetchComments(videoId),
    enabled: Boolean(videoId),
  });
}

export function useAddComment(videoId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text) => addComment(videoId, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.comments.list(videoId) }),
  });
}

export function useDeleteComment(videoId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.comments.list(videoId) }),
  });
}
