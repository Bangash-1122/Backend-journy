import { HttpResponse, http } from 'msw';
import { db } from './seed';

const VIDEO_PLACEHOLDER = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const ok = (data, message = 'OK', status = 200) =>
  HttpResponse.json({ success: true, statusCode: status, data, message }, { status });

const fail = (message, status = 400) =>
  HttpResponse.json({ success: false, statusCode: status, data: null, message }, { status });

function paginate(list, url) {
  const page = Number(url.searchParams.get('page') || 1);
  const limit = Number(url.searchParams.get('limit') || 12);
  const start = (page - 1) * limit;
  const docs = list.slice(start, start + limit);
  return {
    docs,
    page,
    limit,
    totalDocs: list.length,
    totalPages: Math.ceil(list.length / limit) || 1,
    hasNextPage: start + limit < list.length,
  };
}

export const handlers = [
  http.get('*/api/v1/healthcheck', () => ok({ status: 'OK' }, 'API is healthy')),

  http.post('*/api/v1/users/register', async ({ request }) => {
    const form = await request.formData();
    const user = {
      _id: `u-${Date.now()}`,
      username: String(form.get('username')),
      fullName: String(form.get('fullName')),
      email: String(form.get('email')),
      avatar: 'https://i.pravatar.cc/160?img=5',
      coverImage: '',
    };
    db.users.push(user);
    db.session.user = user;
    return ok(user, 'User registered successfully', 201);
  }),

  http.post('*/api/v1/users/login', async ({ request }) => {
    const body = await request.json();
    const user =
      db.users.find((u) => u.email === body.email || u.username === body.username) || db.users[0];
    db.session.user = user;
    return ok({ user, accessToken: 'demo-token', refreshToken: 'demo-refresh' }, 'User logged in successfully');
  }),

  http.post('*/api/v1/users/logout', () => ok({}, 'User logged out successfully')),
  http.post('*/api/v1/users/refresh-token', () =>
    ok({ accessToken: 'demo-token', refreshToken: 'demo-refresh' }, 'Access token refreshed successfully'),
  ),
  http.get('*/api/v1/users/current-user', () => ok(db.session.user)),
  http.patch('*/api/v1/users/update-account', async ({ request }) => {
    const body = await request.json();
    db.session.user = { ...db.session.user, ...body };
    return ok(db.session.user, 'Account details updated successfully');
  }),
  http.post('*/api/v1/users/change-password', () => ok({}, 'Password changed successfully')),
  http.patch('*/api/v1/users/avatar', () => ok(db.session.user, 'Avatar image updated successfully')),
  http.patch('*/api/v1/users/cover-image', () => ok(db.session.user, 'Cover image updated successfully')),

  http.get('*/api/v1/users/c/:username', ({ params }) => {
    const user = db.users.find((u) => u.username === params.username) || db.users[0];
    return ok({
      ...user,
      subscribersCount: 128400,
      channelsSubscribedToCount: 12,
      isSubscribed: db.subscriptions.has(user._id),
    });
  }),

  http.get('*/api/v1/users/watch-history', () =>
    ok(db.history.map((id) => db.videos.find((v) => v._id === id)).filter(Boolean)),
  ),

  http.get('*/api/v1/videos', ({ request }) => {
    const url = new URL(request.url);
    const query = (url.searchParams.get('query') || '').toLowerCase();
    const userId = url.searchParams.get('userId');
    let list = [...db.videos];
    if (userId) list = list.filter((v) => v.owner?._id === userId);
    if (query) {
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.owner.username.toLowerCase().includes(query),
      );
    }
    const sortBy = url.searchParams.get('sortBy');
    if (sortBy === 'views') list.sort((a, b) => b.views - a.views);
    return ok(paginate(list, url));
  }),

  http.get('*/api/v1/videos/:videoId', ({ params }) => {
    const video = db.videos.find((v) => v._id === params.videoId);
    if (!video) return fail('Video not found', 404);
    video.views += 1;
    return ok(video);
  }),

  http.post('*/api/v1/videos', async ({ request }) => {
    const form = await request.formData();
    const video = {
      _id: `v-${Date.now()}`,
      title: String(form.get('title')),
      description: String(form.get('description')),
      thumbnail: 'https://picsum.photos/seed/new-upload/640/360',
      videoFile: VIDEO_PLACEHOLDER,
      duration: 120,
      views: 0,
      isPublished: true,
      category: 'All',
      createdAt: new Date().toISOString(),
      owner: db.session.user,
    };
    db.videos.unshift(video);
    return ok(video, 'Video published successfully', 201);
  }),

  http.patch('*/api/v1/videos/toggle/publish/:videoId', ({ params }) => {
    const video = db.videos.find((v) => v._id === params.videoId);
    if (!video) return fail('Video not found', 404);
    video.isPublished = !video.isPublished;
    return ok(video);
  }),

  http.patch('*/api/v1/videos/:videoId', async ({ params, request }) => {
    const video = db.videos.find((v) => v._id === params.videoId);
    if (!video) return fail('Video not found', 404);
    const form = await request.formData();
    if (form.get('title')) video.title = String(form.get('title'));
    if (form.get('description')) video.description = String(form.get('description'));
    return ok(video);
  }),

  http.delete('*/api/v1/videos/:videoId', ({ params }) => {
    db.videos = db.videos.filter((v) => v._id !== params.videoId);
    return ok({}, 'Video deleted successfully');
  }),

  http.get('*/api/v1/comments/:videoId', ({ params, request }) => {
    const url = new URL(request.url);
    const list = db.comments.filter((c) => c.video === params.videoId);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 20);
    return ok({
      comments: list.slice((page - 1) * limit, page * limit),
      page,
      limit,
      totalComments: list.length,
      totalPages: Math.ceil(list.length / limit) || 1,
    });
  }),

  http.post('*/api/v1/comments/:videoId', async ({ params, request }) => {
    const body = await request.json();
    const comment = {
      _id: `c-${Date.now()}`,
      video: params.videoId,
      text: body.text,
      owner: db.session.user,
      createdAt: new Date().toISOString(),
      likes: 0,
    };
    db.comments.unshift(comment);
    return ok(comment, 'Comment added successfully', 201);
  }),

  http.delete('*/api/v1/comments/c/:commentId', ({ params }) => {
    db.comments = db.comments.filter((c) => c._id !== params.commentId);
    return ok({}, 'Comment deleted successfully');
  }),

  http.patch('*/api/v1/comments/c/:commentId', async ({ params, request }) => {
    const body = await request.json();
    const comment = db.comments.find((c) => c._id === params.commentId);
    if (!comment) return fail('Comment not found', 404);
    comment.text = body.text || body.content || comment.text;
    return ok(comment, 'Comment updated successfully');
  }),

  http.post('*/api/v1/likes/toggle/c/:commentId', ({ params }) => {
    const comment = db.comments.find((c) => c._id === params.commentId);
    if (!comment) return fail('Comment not found', 404);
    comment.likes = (comment.likes || 0) + 1;
    return ok({ likes: comment.likes }, 'Comment liked successfully', 201);
  }),

  http.post('*/api/v1/likes/toggle/t/:tweetId', () => ok({}, 'Tweet liked successfully', 201)),

  http.post('*/api/v1/likes/toggle/v/:videoId', ({ params }) => {
    if (db.likes.has(params.videoId)) {
      db.likes.delete(params.videoId);
      return ok({}, 'Video unliked successfully');
    }
    db.likes.add(params.videoId);
    return ok({}, 'Video liked successfully', 201);
  }),

  http.get('*/api/v1/likes/videos', () =>
    ok([...db.likes].map((id) => ({ video: db.videos.find((v) => v._id === id) })).filter((r) => r.video)),
  ),

  http.post('*/api/v1/subscriptions/c/:channelId', ({ params }) => {
    if (db.subscriptions.has(params.channelId)) {
      db.subscriptions.delete(params.channelId);
      return ok({}, 'subscription removed successfully');
    }
    db.subscriptions.add(params.channelId);
    return ok({}, 'Subscribed to channel successfully', 201);
  }),

  http.get('*/api/v1/subscriptions/u/:subscriberId', () =>
    ok([...db.subscriptions].map((id) => ({ channel: db.users.find((u) => u._id === id) })).filter((r) => r.channel)),
  ),

  http.get('*/api/v1/subscriptions/c/:channelId', ({ params }) =>
    ok({
      subscribers: db.users.filter((_u) => db.subscriptions.has(params.channelId)),
    }),
  ),

  http.get('*/api/v1/playlist/user/:userId', () => ok(db.playlists)),
  http.post('*/api/v1/playlist', async ({ request }) => {
    const body = await request.json();
    const playlist = {
      _id: `p-${Date.now()}`,
      name: body.name,
      description: body.description,
      videos: [],
      owner: db.session.user,
      visibility: 'private',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.playlists.unshift(playlist);
    return ok(playlist, 'Playlist created successfully', 201);
  }),
  http.get('*/api/v1/playlist/:playlistId', ({ params }) => ok(db.playlists.find((p) => p._id === params.playlistId))),
  http.patch('*/api/v1/playlist/add/:videoId/:playlistId', ({ params }) => {
    const playlist = db.playlists.find((p) => p._id === params.playlistId);
    const video = db.videos.find((v) => v._id === params.videoId);
    if (playlist && video && !playlist.videos.some((v) => v._id === video._id)) playlist.videos.push(video);
    return ok(playlist);
  }),
  http.patch('*/api/v1/playlist/remove/:videoId/:playlistId', ({ params }) => {
    const playlist = db.playlists.find((p) => p._id === params.playlistId);
    if (playlist) playlist.videos = playlist.videos.filter((v) => v._id !== params.videoId);
    return ok(playlist);
  }),
  http.patch('*/api/v1/playlist/:playlistId', async ({ params, request }) => {
    const playlist = db.playlists.find((p) => p._id === params.playlistId);
    const body = await request.json();
    Object.assign(playlist, body, { updatedAt: new Date().toISOString() });
    return ok(playlist);
  }),
  http.delete('*/api/v1/playlist/:playlistId', ({ params }) => {
    db.playlists = db.playlists.filter((p) => p._id !== params.playlistId);
    return ok({}, 'Playlist deleted successfully');
  }),

  http.get('*/api/v1/dashboard/stats/:channelId', () =>
    ok({ totalVideos: db.videos.length, totalVideoViews: 4280000, totalSubscribers: 18200, totalLikeCount: 94000 }),
  ),
  http.get('*/api/v1/dashboard/videos/:channelId', () => ok(db.videos.filter((v) => v.owner?._id === db.session.user._id).concat(db.videos.slice(0, 6)))),

  http.get('*/api/v1/tweets/user/:userId', () => ok(db.tweets)),
  http.post('*/api/v1/tweets', async ({ request }) => {
    const body = await request.json();
    const tweet = { _id: `t-${Date.now()}`, content: body.content, owner: db.session.user, createdAt: new Date().toISOString() };
    db.tweets.unshift(tweet);
    return ok(tweet, 'Tweet created successfully', 201);
  }),
  http.patch('*/api/v1/tweets/:tweetId', async ({ params, request }) => {
    const body = await request.json();
    const tweet = db.tweets.find((t) => t._id === params.tweetId);
    if (!tweet) return fail('Tweet not found', 404);
    tweet.content = body.content || tweet.content;
    return ok(tweet, 'Tweet updated successfully');
  }),
  http.delete('*/api/v1/tweets/:tweetId', ({ params }) => {
    db.tweets = db.tweets.filter((t) => t._id !== params.tweetId);
    return ok({}, 'Tweet deleted successfully');
  }),

  // Fallback handler for any unmatched /api/v1/* calls to prevent network failures in mock mode
  http.all('*/api/v1/*', ({ request }) => {
    return ok({}, `Mock fallback for ${request.method} ${request.url}`);
  }),
];
