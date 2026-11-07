import { mapPlaylist } from '@/lib/adapters';
import { LOCAL_PLAYLISTS_KEY } from '@/lib/constants';
import { readJson, writeJson } from '@/lib/storage';
import { api } from './api';

function localPlaylists() {
  return readJson(LOCAL_PLAYLISTS_KEY, []);
}

export async function fetchUserPlaylists(userId) {
  try {
    const { data } = await api.get(`/playlist/user/${userId}`);
    const list = Array.isArray(data.data) ? data.data : [];
    return list.map(mapPlaylist).filter(Boolean);
  } catch {
    return localPlaylists();
  }
}

export async function fetchPlaylist(id) {
  try {
    const { data } = await api.get(`/playlist/${id}`);
    return mapPlaylist(data.data);
  } catch {
    return localPlaylists().find((p) => p.id === id) || null;
  }
}

export async function createPlaylist({ name, description }) {
  try {
    const { data } = await api.post('/playlist', { name, description: description || ' ' });
    return mapPlaylist(data.data);
  } catch {
    const playlist = {
      id: `local-${Date.now()}`,
      name,
      description: description || '',
      videos: [],
      visibility: 'private',
      updatedAt: new Date().toISOString(),
    };
    writeJson(LOCAL_PLAYLISTS_KEY, [...localPlaylists(), playlist]);
    return playlist;
  }
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
