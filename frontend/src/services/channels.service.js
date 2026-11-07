import { mapChannel, mapVideo } from '@/lib/adapters';
import { api } from './api';
import { fetchChannel } from './auth.service';
import { fetchVideos } from './videos.service';

export async function getChannelByUsername(username) {
  const raw = await fetchChannel(username);
  return mapChannel(raw);
}

export async function getChannelVideos(userId, filters) {
  return fetchVideos({ ...filters, userId });
}

export async function toggleSubscription(channelId) {
  const { data } = await api.post(`/subscriptions/c/${channelId}`);
  const message = String(data.message || '');
  return {
    subscribed: message.toLowerCase().includes('subscribed') && !message.toLowerCase().includes('removed'),
    message,
  };
}

export async function getSubscribedChannels(subscriberId) {
  const { data } = await api.get(`/subscriptions/u/${subscriberId}`);
  const rows = Array.isArray(data.data) ? data.data : [];
  return rows.map((row) => mapChannel(row.channel || row)).filter(Boolean);
}

export async function getChannelTweets(userId) {
  const { data } = await api.get(`/tweets/user/${userId}`);
  return Array.isArray(data.data) ? data.data : [];
}

export async function createTweet({ userId, content }) {
  const { data } = await api.post('/tweets', { userId, content });
  return data.data;
}

export { mapVideo };
