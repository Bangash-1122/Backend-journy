export function makeUser(overrides = {}) {
    return {
        id: 'user-1',
        username: 'testuser',
        fullName: 'Test User',
        email: 'test@videohub.app',
        avatar: 'https://i.pravatar.cc/160?img=1',
        coverImage: '',
        subscribersCount: 1200,
        isSubscribed: false,
        ...overrides,
    };
}

export function makeVideo(overrides = {}) {
    return {
        id: 'video-1',
        title: 'Building Modern React Apps',
        description: 'A deep dive into React and Vite development.',
        videoFile: 'https://res.cloudinary.com/demo/video/upload/samples/cld-sample-video.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=640',
        duration: 320,
        views: 45000,
        likes: 1200,
        isPublished: true,
        category: 'Tech',
        createdAt: new Date(Date.now() - 3600 * 24 * 3 * 1000).toISOString(),
        owner: makeUser(),
        ...overrides,
    };
}

export function makePlaylist(overrides = {}) {
    return {
        id: 'playlist-1',
        name: 'React Tutorials',
        description: 'Best React guides',
        visibility: 'public',
        updatedAt: new Date().toISOString(),
        videos: [makeVideo()],
        ...overrides,
    };
}

export function makeComment(overrides = {}) {
    return {
        id: 'comment-1',
        content: 'Great video!',
        createdAt: new Date().toISOString(),
        owner: makeUser(),
        ...overrides,
    };
}