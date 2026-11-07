import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useChannel, useChannelTweets, useChannelVideos } from '@/hooks/useChannel';
import { usePlaylists } from '@/hooks/usePlaylists';
import ChannelHeader from '@/components/channel/ChannelHeader';
import ChannelTabs from '@/components/channel/ChannelTabs';
import VideoGrid from '@/components/video/VideoGrid';
import PlaylistCard from '@/components/playlist/PlaylistCard';
import ErrorState from '@/components/feedback/ErrorState';
import EmptyState from '@/components/feedback/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { formatViews, timeAgo } from '@/lib/format';

export default function ChannelPage() {
  const { channelId } = useParams();
  const user = useAuthStore((s) => s.user);
  const channelQuery = useChannel(channelId);
  const videosQuery = useChannelVideos(channelQuery.data?.id);
  const playlistsQuery = usePlaylists(channelQuery.data?.id);
  const tweetsQuery = useChannelTweets(channelQuery.data?.id);
  const [tab, setTab] = useState('home');
  const channel = channelQuery.data;
  const isOwner = user && channel && (user.id === channel.id || user.username === channel.username);

  if (channelQuery.isLoading) return <Skeleton className="h-48 w-full" />;
  if (channelQuery.isError) return <ErrorState error={channelQuery.error} onRetry={channelQuery.refetch} />;

  const videos = videosQuery.data?.items || [];

  return (
    <div>
      <ChannelHeader channel={channel} isOwner={isOwner} />
      {isOwner ? (
        <Link to="/studio/videos" className="mt-3 inline-block text-sm text-info">
          Manage videos
        </Link>
      ) : null}
      <div className="sticky top-14 z-10 mt-4 bg-bg">
        <ChannelTabs value={tab} onChange={setTab} />
      </div>
      <div className="mt-6">
        {tab === 'home' || tab === 'videos' ? (
          videos.length || videosQuery.isLoading ? (
            <VideoGrid videos={videos} loading={videosQuery.isLoading} />
          ) : (
            <EmptyState title="No videos yet" description="This channel has not published videos." />
          )
        ) : null}
        {tab === 'playlists' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(playlistsQuery.data || []).map((p) => (
              <PlaylistCard key={p.id} playlist={p} />
            ))}
          </div>
        ) : null}
        {tab === 'community' ? (
          <div className="space-y-3">
            {(tweetsQuery.data || []).map((t) => (
              <article key={t._id || t.id} className="rounded-xl border border-border p-4">
                <p className="text-sm">{t.content}</p>
                <p className="mt-2 text-xs text-muted">{timeAgo(t.createdAt)}</p>
              </article>
            ))}
            {!tweetsQuery.data?.length ? <EmptyState title="No community posts" description="Tweets from this channel will show here." /> : null}
          </div>
        ) : null}
        {tab === 'about' ? (
          <div className="max-w-2xl space-y-3 text-sm">
            <p>{channel.description || 'No description yet.'}</p>
            <p className="text-muted">@{channel.username}</p>
            <p className="text-muted">{formatViews(channel.subscribersCount)} subscribers</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
