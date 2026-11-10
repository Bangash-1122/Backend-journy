export const queryKeys = {
  videos: {
    all: ['videos'],
    list: (filters) => ['videos', 'list', filters],
    detail: (id) => ['videos', 'detail', id],
    search: (filters) => ['videos', 'search', filters],
    shorts: (filters) => ['videos', 'shorts', filters],
    recommendations: (filters) => ['videos', 'recommendations', filters],
    related: (id) => ['videos', 'related', id],
  },
  comments: {
    all: ['comments'],
    list: (videoId) => ['comments', 'list', videoId],
  },
  channels: {
    all: ['channels'],
    detail: (id) => ['channels', 'detail', id],
    videos: (id, filters) => ['channels', 'videos', id, filters],
    tweets: (id) => ['channels', 'tweets', id],
  },
  playlists: {
    all: ['playlists'],
    mine: (userId) => ['playlists', 'user', userId],
    detail: (id) => ['playlists', 'detail', id],
  },
  library: {
    history: ['library', 'history'],
    liked: ['library', 'liked'],
    later: ['library', 'later'],
  },
  subscriptions: {
    channels: (userId) => ['subscriptions', 'channels', userId],
    feed: (filters) => ['subscriptions', 'feed', filters],
  },
  studio: {
    stats: (channelId) => ['studio', 'stats', channelId],
    videos: (channelId) => ['studio', 'videos', channelId],
    analytics: (range) => ['studio', 'analytics', range],
  },
  auth: {
    me: ['auth', 'me'],
  },
};
