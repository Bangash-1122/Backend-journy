import { mapVideo } from '@/lib/adapters';
import { api } from './api';

export async function fetchStudioStats(channelId, { signal } = {}) {
  const { data } = await api.get(`/dashboard/stats/${channelId}`, { signal });
  return data.data;
}

export async function fetchStudioVideos(channelId, { signal } = {}) {
  const { data } = await api.get(`/dashboard/videos/${channelId}`, { signal });
  const list = Array.isArray(data.data) ? data.data : [];
  return list.map(mapVideo).filter(Boolean);
}

export async function fetchStudioAnalytics(channelId, range = '7D', { signal } = {}) {
  try {
    const { data } = await api.get(`/dashboard/analytics/${channelId}`, { params: { range }, signal });
    return { sample: false, points: data.data };
  } catch {
    return { sample: true, points: sampleAnalytics(range) };
  }
}

export function sampleAnalytics(range = '7D') {
  const days = range === '90D' ? 90 : range === '28D' ? 28 : 7;
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: 1800 + Math.round(Math.sin(i / 2) * 800) + i * 90,
      watchMinutes: 420 + Math.round(Math.cos(i / 3) * 120) + i * 8,
      subscribers: Math.round(Math.sin(i / 2.4) * 12) + 4,
    };
  });
}
