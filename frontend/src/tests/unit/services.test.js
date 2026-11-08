import {
    describe,
    it,
    expect,
    vi
} from 'vitest';
import {
    toggleVideoLike
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
});