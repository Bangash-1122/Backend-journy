/** Normalize chai-backend ApiResponse + controller argument mix-ups. */
export function unwrapBody(body) {
  if (!body || typeof body !== 'object') return { success: true, data: body, message: 'OK' };

  const looksSwapped =
    typeof body.data === 'string' && body.message && typeof body.message === 'object';

  if (looksSwapped) {
    return { ...body, data: body.message, message: body.data, success: body.success ?? true };
  }

  return body;
}

export function mapUser(user) {
  if (!user || typeof user !== 'object') return null;
  return {
    id: user._id || user.id,
    username: user.username,
    fullName: user.fullName || user.name || user.username,
    email: user.email,
    avatar: user.avatar,
    coverImage: user.coverImage,
    createdAt: user.createdAt,
  };
}

export function mapVideo(video) {
  if (!video) return null;
  const owner = mapUser(video.owner || video.user) || {
    id: video.owner,
    username: 'channel',
    fullName: 'Channel',
    avatar: '',
  };
  return {
    id: video._id || video.id,
    title: video.title,
    description: video.description || '',
    thumbnail: video.thumbnail,
    videoFile: video.videoFile,
    duration: video.duration || 0,
    views: video.views || 0,
    isPublished: video.isPublished ?? true,
    createdAt: video.createdAt,
    category: video.category || 'All',
    likes: video.likes || 0,
    isShort: Boolean(video.isShort || (video.duration > 0 && video.duration <= 60 && video.aspectRatio === '9:16')),
    aspectRatio: video.aspectRatio || (video.isShort ? '9:16' : '16:9'),
    isLiked: Boolean(video.isLiked),
    owner,
    raw: video,
  };
}

export function mapPaginatedVideos(data) {
  if (Array.isArray(data)) {
    return {
      items: data.map(mapVideo).filter(Boolean),
      pagination: {
        page: 1,
        limit: data.length,
        total: data.length,
        hasMore: false,
      },
    };
  }

  const docs = data?.docs || data?.videos || data?.items || [];
  return {
    items: docs.map(mapVideo).filter(Boolean),
    pagination: {
      page: data?.page || 1,
      limit: data?.limit || docs.length,
      total: data?.totalDocs || data?.total || docs.length,
      hasMore: Boolean(data?.hasNextPage) || Boolean(data?.pagination?.hasMore),
    },
  };
}

export function mapChannel(channel) {
  if (!channel) return null;
  return {
    ...mapUser(channel),
    subscribersCount:
      channel.subscribersCount ?? channel.subscripbersCount ?? channel.subscriberCount ?? 0,
    channelsSubscribedToCount: channel.channelsSubscribedToCount ?? 0,
    isSubscribed: Boolean(channel.isSubscribed),
    description: channel.description || '',
    verified: Boolean(channel.verified),
  };
}

export function mapComment(comment, fallbackUser) {
  if (!comment) return null;
  const owner = mapUser(comment.owner || comment.user) || fallbackUser || {
    id: typeof comment.owner === 'string' ? comment.owner : (comment.user || 'user'),
    username: 'user',
    fullName: 'User',
    avatar: '',
  };
  return {
    id: comment._id || comment.id,
    text: comment.text || comment.content || '',
    createdAt: comment.createdAt,
    likes: comment.likes || 0,
    owner,
    videoId: comment.video || comment.videoId,
  };
}

export function mapPlaylist(playlist) {
  if (!playlist) return null;
  const videos = (playlist.videos || []).map((item) =>
    typeof item === 'object' ? mapVideo(item) : { id: item },
  );
  return {
    id: playlist._id || playlist.id,
    name: playlist.name || playlist.title,
    description: playlist.description || '',
    videos,
    owner: mapUser(playlist.owner || playlist.user),
    visibility: playlist.visibility || 'public',
    updatedAt: playlist.updatedAt || playlist.createdAt,
    createdAt: playlist.createdAt,
  };
}
