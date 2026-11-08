import axios from 'axios';
import { env } from '@/lib/env';
import { unwrapBody } from '@/lib/adapters';
import { normalizeError } from '@/lib/errors';
import { clearSession, getRefreshToken, getToken, useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let refreshing = null;

async function refreshAccess() {
  const refreshToken = getRefreshToken();
  const { data } = await axios.post(
    `${env.apiUrl}/users/refresh-token`,
    refreshToken ? { refreshToken } : {},
    { withCredentials: true },
  );
  const body = unwrapBody(data);
  const accessToken = body?.data?.accessToken;
  const nextRefresh = body?.data?.refreshToken;
  const current = useAuthStore.getState();
  if (accessToken) current.login(current.user, accessToken, nextRefresh);
  return accessToken;
}

api.interceptors.response.use(
  (res) => {
    res.data = unwrapBody(res.data);
    return res;
  },
  async (err) => {
    const original = err.config || {};
    const status = err.response?.status;
    const url = String(original.url || '');
    const isAuthCall =
      url.includes('/users/login') ||
      url.includes('/users/register') ||
      url.includes('/users/refresh-token') ||
      url.includes('/users/logout');

    if (status === 401 && !original._retry && !isAuthCall) {
      original._retry = true;
      try {
        if (!refreshing) refreshing = refreshAccess().finally(() => { refreshing = null; });
        const token = await refreshing;
        if (token) {
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        clearSession();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }

    return Promise.reject(normalizeError(err));
  },
);

export const uploadClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 0,
  withCredentials: true,
});

uploadClient.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
