import { mapComment } from '@/lib/adapters';
import { api } from './api';

export async function fetchComments(videoId, { page = 1, limit = 20 } = {}) {
  const { data } = await api.get(`/comments/${videoId}`, { params: { page, limit } });
  const payload = data.data;
  const list = payload?.comments || (Array.isArray(payload) ? payload : []);
  return {
    items: list.map((item) => mapComment(item)).filter(Boolean),
    page: payload?.page || page,
    total: payload?.totalComments || list.length,
    totalPages: payload?.totalPages || 1,
  };
}

export async function addComment(videoId, text) {
  const { data } = await api.post(`/comments/${videoId}`, { text, content: text });
  return mapComment(data.data);
}

export async function updateComment(commentId, text) {
  const { data } = await api.patch(`/comments/c/${commentId}`, { text, content: text });
  return mapComment(data.data);
}

export async function deleteComment(commentId) {
  const { data } = await api.delete(`/comments/c/${commentId}`);
  return data;
}

export async function toggleCommentLike(commentId) {
  const { data } = await api.post(`/likes/toggle/c/${commentId}`);
  return data;
}
