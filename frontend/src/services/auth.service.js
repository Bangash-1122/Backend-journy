import { mapUser } from '@/lib/adapters';
import { api } from './api';

export async function registerUser(payload) {
  const form = new FormData();
  form.append('fullName', payload.fullName);
  form.append('username', payload.username);
  form.append('email', payload.email);
  form.append('password', payload.password);
  if (payload.avatar) form.append('avatar', payload.avatar);
  if (payload.coverImage) form.append('coverImage', payload.coverImage);
  const { data } = await api.post('/users/register', form);
  return mapUser(data.data);
}

export async function loginUser({ email, username, password }) {
  const { data } = await api.post('/users/login', { email, username, password });
  return {
    user: mapUser(data.data?.user),
    token: data.data?.accessToken,
    refreshToken: data.data?.refreshToken,
  };
}

export async function logoutUser() {
  await api.post('/users/logout');
}

export async function fetchCurrentUser({ signal } = {}) {
  const { data } = await api.get('/users/current-user', { signal });
  return mapUser(data.data);
}

export async function updateAccount({ fullName, email }) {
  const { data } = await api.patch('/users/update-account', { fullName, email });
  return mapUser(data.data);
}

export async function changePassword({ oldPassword, newPassword }) {
  const { data } = await api.post('/users/change-password', { oldPassword, newPassword });
  return data;
}

export async function updateAvatar(file) {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await api.patch('/users/avatar', form);
  return mapUser(data.data);
}

export async function updateCoverImage(file) {
  const form = new FormData();
  form.append('coverImage', file);
  const { data } = await api.patch('/users/cover-image', form);
  return mapUser(data.data);
}

export async function fetchChannel(username, { signal } = {}) {
  const { data } = await api.get(`/users/c/${username}`, { signal });
  return data.data;
}

export async function fetchWatchHistory({ signal } = {}) {
  const { data } = await api.get('/users/watch-history', { signal });
  return data.data;
}
