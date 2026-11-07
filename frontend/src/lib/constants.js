export const CATEGORIES = [
  'All',
  'Music',
  'Gaming',
  'News',
  'Sports',
  'Learning',
  'Comedy',
  'Tech',
  'Travel',
  'Cooking',
];

export const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'unlisted', label: 'Unlisted' },
  { value: 'private', label: 'Private' },
];

export const SEARCH_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'video', label: 'Videos' },
  { value: 'channel', label: 'Channels' },
  { value: 'playlist', label: 'Playlists' },
];

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Upload date' },
  { value: 'views', label: 'View count' },
];

export const DURATION_FILTERS = [
  { value: 'any', label: 'Any duration' },
  { value: 'short', label: 'Under 4 min' },
  { value: 'medium', label: '4–20 min' },
  { value: 'long', label: 'Over 20 min' },
];

export const SIDEBAR_MAIN = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/subscriptions', label: 'Subscriptions', icon: 'subscriptions', auth: true },
];

export const SIDEBAR_YOU = [
  { to: '/channel/me', label: 'Your channel', icon: 'channel', auth: true },
  { to: '/library?tab=history', label: 'History', icon: 'history', auth: true },
  { to: '/library?tab=later', label: 'Watch later', icon: 'later', auth: true },
  { to: '/library?tab=liked', label: 'Liked videos', icon: 'liked', auth: true },
  { to: '/playlists', label: 'Playlists', icon: 'playlists', auth: true },
];

export const STUDIO_NAV = [
  { to: '/studio', label: 'Dashboard', icon: 'dashboard' },
  { to: '/studio/videos', label: 'Videos', icon: 'videos' },
  { to: '/studio/analytics', label: 'Analytics', icon: 'analytics' },
  { to: '/settings?tab=channel', label: 'Settings', icon: 'settings' },
];

export const SETTINGS_NAV = [
  { id: 'account', label: 'Account' },
  { id: 'channel', label: 'Channel' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'playback', label: 'Playback' },
];

export const RECENT_SEARCHES_KEY = 'videohub-recent-searches';
export const WATCH_LATER_KEY = 'videohub-watch-later';
export const LOCAL_LIKES_KEY = 'videohub-local-likes';
export const LOCAL_HISTORY_KEY = 'videohub-local-history';
export const LOCAL_PLAYLISTS_KEY = 'videohub-local-playlists';
