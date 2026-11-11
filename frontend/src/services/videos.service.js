import { mapPaginatedVideos, mapVideo } from '@/lib/adapters';
import { api } from './api';

export async function fetchVideos({ page = 1, limit = 12, query, sortBy, sortType, userId, signal } = {}) {
  const { data } = await api.get('/videos', {
    params: { page, limit, query, sortBy, sortType, userId },
    signal,
  });
  return mapPaginatedVideos(data.data);
}

export async function fetchVideoById(id, { signal } = {}) {
  const { data } = await api.get(`/videos/${id}`, { signal });
  return mapVideo(data.data);
}

export async function updateVideo(id, payload) {
  const form = new FormData();
  if (payload.title) form.append('title', payload.title);
  if (payload.description) form.append('description', payload.description);
  if (payload.thumbnail) form.append('thumbnail', payload.thumbnail);
  const { data } = await api.patch(`/videos/${id}`, form);
  return mapVideo(data.data);
}

export async function deleteVideo(id) {
  const { data } = await api.delete(`/videos/${id}`);
  return data;
}

export async function togglePublish(id) {
  const { data } = await api.patch(`/videos/toggle/publish/${id}`);
  return mapVideo(data.data);
}

export async function toggleVideoLike(id) {
  const { data } = await api.post(`/likes/toggle/v/${id}`);
  const isLiked =
    typeof data.data?.isLiked === 'boolean'
      ? data.data.isLiked
      : String(data.message || '').toLowerCase().includes('liked') &&
        !String(data.message || '').toLowerCase().includes('unliked');
  return { liked: isLiked, isLiked, message: data.message };
}

export async function fetchLikedVideos({ signal } = {}) {
  const { data } = await api.get('/likes/videos', { signal });
  const rows = Array.isArray(data.data) ? data.data : [];
  return rows.map((row) => mapVideo(row.video || row)).filter(Boolean);
}

export async function fetchShorts({ page = 1, limit = 10, signal } = {}) {
  const { data } = await api.get('/videos/feed/shorts', {
    params: { page, limit },
    signal,
  });
  return mapPaginatedVideos(data.data);
}

export async function fetchRecommendedVideos({ page = 1, limit = 12, category, signal } = {}) {
  const { data } = await api.get('/videos/feed/recommendations', {
    params: { page, limit, category },
    signal,
  });
  return mapPaginatedVideos(data.data);
}

export async function fetchRelatedVideos(videoId, { limit = 12, signal } = {}) {
  const { data } = await api.get(`/videos/related/${videoId}`, {
    params: { limit },
    signal,
  });
  const rows = Array.isArray(data.data) ? data.data : data.data?.docs || [];
  return rows.map(mapVideo).filter(Boolean);
}
