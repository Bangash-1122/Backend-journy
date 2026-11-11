import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useToggleLike } from '@/hooks/useVideos';
import { useAddComment } from '@/hooks/useComments';
import { useToggleSubscribe } from '@/hooks/useChannel';
import { queryKeys } from '@/lib/queryKeys';
import * as videoService from '@/services/videos.service';
import * as commentService from '@/services/comments.service';
import * as channelService from '@/services/channels.service';

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

describe('TanStack Query Optimistic UI & Rollback Architecture', () => {
  it('useToggleLike optimistically toggles like and rolls back on failure', async () => {
    const { queryClient, wrapper } = createTestWrapper();
    const videoId = 'test-vid-1';

    // Seed initial cache
    queryClient.setQueryData(queryKeys.videos.detail(videoId), {
      id: videoId,
      title: 'Test Video',
      likes: 15,
      isLiked: false,
    });

    // Mock API failure
    vi.spyOn(videoService, 'toggleVideoLike').mockRejectedValueOnce(new Error('500 Server Error'));

    const { result } = renderHook(() => useToggleLike(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync(videoId);
      } catch {
        // Expected failure
      }
    });

    // Verify rollback restored initial state
    const cached = queryClient.getQueryData(queryKeys.videos.detail(videoId));
    expect(cached).toBeDefined();
    expect(cached.isLiked).toBe(false);
    expect(cached.likes).toBe(15);
  });

  it('useAddComment optimistically prepends comment and rolls back on failure', async () => {
    const { queryClient, wrapper } = createTestWrapper();
    const videoId = 'test-vid-2';

    // Seed initial comments
    const initialComments = {
      items: [{ id: 'c-1', text: 'Existing comment', likes: 2 }],
      total: 1,
      page: 1,
      totalPages: 1,
    };
    queryClient.setQueryData(queryKeys.comments.list(videoId), initialComments);

    // Mock API failure
    vi.spyOn(commentService, 'addComment').mockRejectedValueOnce(new Error('Failed to comment'));

    const { result } = renderHook(() => useAddComment(videoId), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync('New pending comment');
      } catch {
        // Expected failure
      }
    });

    // Verify rollback
    const cached = queryClient.getQueryData(queryKeys.comments.list(videoId));
    expect(cached.items).toHaveLength(1);
    expect(cached.items[0].text).toBe('Existing comment');
    expect(cached.total).toBe(1);
  });

  it('useToggleSubscribe optimistically updates subscriber count and rolls back on failure', async () => {
    const { queryClient, wrapper } = createTestWrapper();
    const channelId = 'chan-99';

    // Seed channel cache
    queryClient.setQueryData(queryKeys.channels.detail('creator'), {
      id: channelId,
      username: 'creator',
      subscribersCount: 100,
      isSubscribed: false,
    });

    // Mock failure
    vi.spyOn(channelService, 'toggleSubscription').mockRejectedValueOnce(new Error('Subscription failed'));

    const { result } = renderHook(() => useToggleSubscribe(), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync(channelId);
      } catch {
        // Expected failure
      }
    });

    // Verify rollback
    const cached = queryClient.getQueryData(queryKeys.channels.detail('creator'));
    expect(cached.isSubscribed).toBe(false);
    expect(cached.subscribersCount).toBe(100);
  });
});

