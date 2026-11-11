import {
    describe,
    it,
    expect,
    vi
} from 'vitest';
import {
    toggleVideoLike,
    fetchShorts,
    fetchRecommendedVideos,
    fetchRelatedVideos
} from '@/services/videos.service';
import {
    toggleSubscription
} from '@/services/channels.service';
import {
    fetchPlaylist,
    createPlaylist
} from '@/services/playlists.service';
import {
    toggleCommentLike
} from '@/services/comments.service';
import {
    fetchStudioAnalytics
} from '@/services/studio.service';
import {
    mapComment
} from '@/lib/adapters';
import {
    api
} from '@/services/api';

describe('Frontend Services Optimization & Contracts', () => {
    it('toggleVideoLike reads structured boolean flag isLiked', async () => {
        vi.spyOn(api, 'post').mockResolvedValueOnce({
            data: {
                success: true,
                statusCode: 200,
                data: {
                    isLiked: true
                },
                message: 'Video liked'
            },
        });

        const res1 = await toggleVideoLike('vid-123');
        expect(res1.isLiked).toBe(true);
        expect(res1.liked).toBe(true);

        vi.spyOn(api, 'post').mockResolvedValueOnce({
            data: {
                success: true,
                statusCode: 200,
                data: {
                    isLiked: false
                },
                message: 'Video unliked'
            },
        });

        const res2 = await toggleVideoLike('vid-123');
        expect(res2.isLiked).toBe(false);
        expect(res2.liked).toBe(false);
    });

    it('toggleSubscription reads structured boolean flag isSubscribed', async () => {
        vi.spyOn(api, 'post').mockResolvedValueOnce({
            data: {
                success: true,
                statusCode: 200,
                data: {
                    isSubscribed: true
                },
                message: 'Channel subscribed successfully'
            },
        });

        const res1 = await toggleSubscription('chan-123');
        expect(res1.isSubscribed).toBe(true);
        expect(res1.subscribed).toBe(true);

        vi.spyOn(api, 'post').mockResolvedValueOnce({
            data: {
                success: true,
                statusCode: 200,
                data: {
                    isSubscribed: false
                },
                message: 'Channel unsubscribed successfully'
            },
        });

        const res2 = await toggleSubscription('chan-123');
        expect(res2.isSubscribed).toBe(false);
        expect(res2.subscribed).toBe(false);
    });

    it('toggleCommentLike reads structured boolean flag isLiked', async () => {
        vi.spyOn(api, 'post').mockResolvedValueOnce({
            data: {
                success: true,
                statusCode: 200,
                data: {
                    isLiked: true
                },
                message: 'Comment liked'
            },
        });

        const res = await toggleCommentLike('com-123');
        expect(res.isLiked).toBe(true);
        expect(res.liked).toBe(true);
    });

    it('playlists service throws errors rather than hiding failures in localStorage', async () => {
        vi.spyOn(api, 'get').mockRejectedValueOnce(new Error('Network error'));
        await expect(fetchPlaylist('p-123')).rejects.toThrow('Network error');

        vi.spyOn(api, 'post').mockRejectedValueOnce(new Error('Validation failed'));
        await expect(createPlaylist({
            name: 'My Playlist'
        })).rejects.toThrow('Validation failed');
    });

    it('mapComment gracefully handles unpopulated or missing author objects', () => {
        const rawComment = {
            _id: 'c-1',
            content: 'Great video!',
            owner: 'user-id-string-only',
            createdAt: '2026-11-08T00:00:00.000Z',
        };

        const mapped = mapComment(rawComment);
        expect(mapped).toBeTruthy();
        expect(mapped.text).toBe('Great video!');
        expect(mapped.owner).toBeDefined();
        expect(mapped.owner.username).toBe('user');
        expect(mapped.owner.fullName).toBe('User');
    });

    it('fetchShorts queries feed shorts and maps paginated items', async () => {
        vi.spyOn(api, 'get').mockResolvedValueOnce({
            data: {
                success: true,
                data: {
                    docs: [
                        { _id: 's-1', title: 'Short 1', duration: 30, isShort: true, videoFile: 'video.mp4', owner: { _id: 'u-1', username: 'alex' } }
                    ],
                    page: 1,
                    totalPages: 1,
                    totalDocs: 1,
                    hasNextPage: false
                }
            }
        });

        const res = await fetchShorts({ page: 1 });
        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('s-1');
        expect(res.items[0].isShort).toBe(true);
    });

    it('fetchRecommendedVideos queries feed recommendations', async () => {
        vi.spyOn(api, 'get').mockResolvedValueOnce({
            data: {
                success: true,
                data: {
                    docs: [
                        { _id: 'v-10', title: 'Recommended 1', views: 5000, owner: { _id: 'u-2', username: 'creator' } }
                    ],
                    page: 1,
                    totalPages: 1,
                    totalDocs: 1,
                    hasNextPage: false
                }
            }
        });

        const res = await fetchRecommendedVideos({ category: 'Tech' });
        expect(res.items).toHaveLength(1);
        expect(res.items[0].id).toBe('v-10');
    });

    it('fetchRelatedVideos queries related videos for a target video', async () => {
        vi.spyOn(api, 'get').mockResolvedValueOnce({
            data: {
                success: true,
                data: [
                    { _id: 'v-20', title: 'Related Video', duration: 180, owner: { _id: 'u-3', username: 'dan' } }
                ]
            }
        });

        const res = await fetchRelatedVideos('v-1');
        expect(res).toHaveLength(1);
        expect(res[0].id).toBe('v-20');
        expect(res[0].title).toBe('Related Video');
    });

    it('fetchStudioAnalytics guarantees points array for chart safety', async () => {
        const res = await fetchStudioAnalytics('u-123', '7D');
        expect(res).toBeDefined();
        expect(Array.isArray(res.points)).toBe(true);
        expect(res.points.length).toBe(7);
        expect(res.points[0]).toHaveProperty('views');
        expect(res.points[0]).toHaveProperty('date');
    });
});