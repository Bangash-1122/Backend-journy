const VIDEO_SRC = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const demoUser = {
  _id: 'u-demo',
  username: 'videohub',
  fullName: 'VideoHub Demo',
  email: 'demo@videohub.app',
  avatar: 'https://i.pravatar.cc/160?img=12',
  coverImage: 'https://picsum.photos/seed/cover-demo/1600/400',
  createdAt: '2024-01-12T10:00:00.000Z',
};

export const users = [
  demoUser,
  {
    _id: 'u-2',
    username: 'travelog',
    fullName: 'Travelog',
    email: 'travel@videohub.app',
    avatar: 'https://i.pravatar.cc/160?img=32',
    coverImage: 'https://picsum.photos/seed/cover-travel/1600/400',
    verified: true,
  },
  {
    _id: 'u-3',
    username: 'codecraft',
    fullName: 'CodeCraft',
    email: 'code@videohub.app',
    avatar: 'https://i.pravatar.cc/160?img=15',
    coverImage: 'https://picsum.photos/seed/cover-code/1600/400',
    verified: true,
  },
  {
    _id: 'u-4',
    username: 'beatslab',
    fullName: 'Beats Lab',
    email: 'beats@videohub.app',
    avatar: 'https://i.pravatar.cc/160?img=45',
    coverImage: 'https://picsum.photos/seed/cover-music/1600/400',
  },
];

const titles = [
  ['Explore the World in 4K', 'Travel', 'u-2', 842000, 842],
  ['React + Vite for Beginners', 'Learning', 'u-3', 128400, 1264],
  ['Late Night Lo-fi Mix', 'Music', 'u-4', 2100000, 3720],
  ['Stadium Highlights 2026', 'Sports', 'u-2', 540300, 720],
  ['Build a Video Platform', 'Tech', 'u-3', 98000, 1540],
  ['Street Food in Tokyo', 'Cooking', 'u-2', 310400, 910],
  ['Indie Game Speedrun', 'Gaming', 'u-3', 76000, 1840],
  ['Morning Comedy Hour', 'Comedy', 'u-4', 220100, 640],
  ['Daily News Briefing', 'News', 'u-2', 44000, 480],
  ['Hidden Alpine Trails', 'Travel', 'u-2', 155000, 1102],
  ['TypeScript-free React Tips', 'Tech', 'u-3', 67000, 890],
  ['Live Set — Red Room', 'Music', 'u-4', 990000, 2400],
];

export const videos = titles.map(([title, category, ownerId, views, duration], i) => {
  const owner = users.find((u) => u._id === ownerId);
  const created = new Date();
  created.setDate(created.getDate() - (i * 2 + 1));
  return {
    _id: `v-${i + 1}`,
    title,
    description: `${title}. Shot for VideoHub demo. Category: ${category}. This page works without a live server using MSW seed data.`,
    thumbnail: `https://picsum.photos/seed/vh-${i + 1}/640/360`,
    videoFile: VIDEO_SRC,
    duration,
    views,
    isPublished: true,
    category,
    likes: Math.round(views / 40),
    createdAt: created.toISOString(),
    owner,
  };
});

export const comments = videos.slice(0, 4).flatMap((video, vi) =>
  users.map((user, ui) => ({
    _id: `c-${vi}-${ui}`,
    video: video._id,
    text: ui === 0 ? 'This is exactly the kind of quality I wanted to see on VideoHub.' : `Loved the ${video.category.toLowerCase()} energy here.`,
    createdAt: new Date(Date.now() - (ui + 1) * 3600_000).toISOString(),
    owner: user,
    likes: 12 - ui,
  })),
);

export const playlists = [
  {
    _id: 'p-1',
    name: 'Weekend watch',
    description: 'Travel and food picks',
    videos: videos.slice(0, 5),
    owner: demoUser,
    visibility: 'public',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'p-2',
    name: 'Learn in public',
    description: 'Tech deep dives',
    videos: videos.filter((v) => v.category === 'Tech' || v.category === 'Learning'),
    owner: demoUser,
    visibility: 'unlisted',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export const tweets = [
  {
    _id: 't-1',
    content: 'New travel series drops Friday. Stay tuned.',
    owner: users[1],
    createdAt: new Date(Date.now() - 86400_000).toISOString(),
  },
];

export const db = {
  users: [...users],
  videos: [...videos],
  comments: [...comments],
  playlists: [...playlists],
  tweets: [...tweets],
  likes: new Set(['v-1', 'v-3']),
  subscriptions: new Set(['u-2', 'u-3']),
  history: ['v-1', 'v-4', 'v-2'],
  watchLater: ['v-5', 'v-7'],
  session: { user: demoUser, accessToken: 'demo-token', refreshToken: 'demo-refresh' },
};
