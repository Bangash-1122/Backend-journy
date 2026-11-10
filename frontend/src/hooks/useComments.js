import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { addComment, deleteComment, fetchComments, toggleCommentLike } from '@/services/comments.service';
import { useAuthStore } from '@/store/authStore';

export function useComments(videoId) {
  return useQuery({
    queryKey: queryKeys.comments.list(videoId),
    queryFn: ({ signal }) => fetchComments(videoId, { signal }),
    enabled: Boolean(videoId),
  });
}

export function useAddComment(videoId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text) => addComment(videoId, text),
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: queryKeys.comments.list(videoId) });
      const previousComments = qc.getQueryData(queryKeys.comments.list(videoId));
      const currentUser = useAuthStore.getState().user;

      const optimisticComment = {
        id: `temp-${Date.now()}`,
        text,
        content: text,
        createdAt: new Date().toISOString(),
        owner: {
          id: currentUser?.id || currentUser?._id || 'me',
          username: currentUser?.username || 'you',
          fullName: currentUser?.fullName || 'You',
          avatar: currentUser?.avatar || '',
        },
        likes: 0,
        isLiked: false,
        isPending: true,
      };

      if (previousComments) {
        qc.setQueryData(queryKeys.comments.list(videoId), {
          ...previousComments,
          items: [optimisticComment, ...(previousComments.items || [])],
          total: (previousComments.total || 0) + 1,
        });
      }

      return { previousComments, videoId };
    },
    onError: (_err, _text, context) => {
      if (context?.previousComments && context?.videoId) {
        qc.setQueryData(queryKeys.comments.list(context.videoId), context.previousComments);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(videoId) });
    },
  });
}

export function useDeleteComment(videoId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteComment,
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: queryKeys.comments.list(videoId) });
      const previousComments = qc.getQueryData(queryKeys.comments.list(videoId));

      if (previousComments) {
        qc.setQueryData(queryKeys.comments.list(videoId), {
          ...previousComments,
          items: (previousComments.items || []).filter((c) => c.id !== commentId && c._id !== commentId),
          total: Math.max(0, (previousComments.total || 0) - 1),
        });
      }

      return { previousComments, videoId };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previousComments && context?.videoId) {
        qc.setQueryData(queryKeys.comments.list(context.videoId), context.previousComments);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(videoId) });
    },
  });
}

export function useToggleCommentLike(videoId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleCommentLike,
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: queryKeys.comments.list(videoId) });
      const previousComments = qc.getQueryData(queryKeys.comments.list(videoId));

      if (previousComments) {
        qc.setQueryData(queryKeys.comments.list(videoId), {
          ...previousComments,
          items: (previousComments.items || []).map((c) => {
            if (c.id === commentId || c._id === commentId) {
              const nextLiked = !c.isLiked;
              return {
                ...c,
                isLiked: nextLiked,
                likes: Math.max(0, (c.likes || 0) + (nextLiked ? 1 : -1)),
              };
            }
            return c;
          }),
        });
      }

      return { previousComments, videoId };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previousComments && context?.videoId) {
        qc.setQueryData(queryKeys.comments.list(context.videoId), context.previousComments);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(videoId) });
    },
  });
}
