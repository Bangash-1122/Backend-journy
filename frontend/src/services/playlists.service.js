import { mapPlaylist } from '@/lib/adapters';
import { api } from './api';

export async function fetchUserPlaylists(userId, { signal } = {}) {
  const { data } = await api.get(`/playlist/user/${userId}`, { signal });
  const list = Array.isArray(data.data) ? data.data : [];
  return list.map(mapPlaylist).filter(Boolean);
}

export async function fetchPlaylist(id, { signal } = {}) {
  const { data } = await api.get(`/playlist/${id}`, { signal });
  return mapPlaylist(data.data);
}

export async function createPlaylist({ name, description }) {
  const { data } = await api.post('/playlist', { name, description: description || ' ' });
  return mapPlaylist(data.data);
}

export async function updatePlaylist(id, payload) {
  const { data } = await api.patch(`/playlist/${id}`, payload);
  return mapPlaylist(data.data);
}

export async function deletePlaylist(id) {
  await api.delete(`/playlist/${id}`);
}

export async function addVideoToPlaylist(playlistId, videoId) {
  const { data } = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
  return mapPlaylist(data.data);
}

export async function removeVideoFromPlaylist(playlistId, videoId) {
  const { data } = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
  return mapPlaylist(data.data);
}
