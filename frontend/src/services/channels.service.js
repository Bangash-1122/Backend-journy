import { mapChannel, mapVideo } from '@/lib/adapters';
import { api } from './api';
import { fetchChannel } from './auth.service';
import { fetchVideos } from './videos.service';

export async function getChannelByUsername(username, { signal } = {}) {
  const raw = await fetchChannel(username, { signal });
  return mapChannel(raw);
}

export async function getChannelVideos(userId, filters) {
  return fetchVideos({ ...filters, userId });
}

export async function toggleSubscription(channelId) {
  const { data } = await api.post(`/subscriptions/c/${channelId}`);
  const isSubscribed =
    typeof data.data?.isSubscribed === 'boolean'
      ? data.data.isSubscribed
      : String(data.message || '').toLowerCase().includes('subscribed') &&
        !String(data.message || '').toLowerCase().includes('removed');
  return {
    subscribed: isSubscribed,
    isSubscribed,
    message: data.message,
  };
}

export async function getSubscribedChannels(subscriberId, { signal } = {}) {
  const { data } = await api.get(`/subscriptions/u/${subscriberId}`, { signal });
  const rows = Array.isArray(data.data) ? data.data : [];
  return rows.map((row) => mapChannel(row.channel || row)).filter(Boolean);
}

export async function getChannelTweets(userId, { signal } = {}) {
  const { data } = await api.get(`/tweets/user/${userId}`, { signal });
  return Array.isArray(data.data) ? data.data : [];
}

export async function createTweet({ userId, content }) {
  const { data } = await api.post('/tweets', { content, ...(userId ? { userId } : {}) });
  return data.data;
}

export { mapVideo };
