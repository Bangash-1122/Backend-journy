import { useState } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSubscribedChannels } from '@/hooks/useChannel';
import { useVideos } from '@/hooks/useVideos';
import VideoGrid from '@/components/video/VideoGrid';
import EmptyState from '@/components/feedback/EmptyState';
import Avatar from '@/components/ui/Avatar';

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const channels = useSubscribedChannels(user?.id);
  const videos = useVideos({ limit: 16 });
  const [filter, setFilter] = useState('all');
  const items = videos.data?.pages.flatMap((p) => p.items) ?? [];
  const list = filter === 'all' ? items : items.filter((v) => v.owner?.id === filter);

  if (!channels.data?.length && !videos.isLoading) {
    return (
      <EmptyState
        icon={Users}
        title="No subscriptions"
        description="Discover channels and follow them to build your feed."
        actionLabel="Browse"
        onAction={() => navigate('/')}
      />
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Subscriptions</h1>
      <div className="mb-6 flex gap-3 overflow-x-auto scrollbar-hide">
        <button onClick={() => setFilter('all')} className="text-sm font-semibold">
          All
        </button>
        {(channels.data || []).map((ch) => (
          <button key={ch.id} className="flex flex-col items-center gap-1" onClick={() => setFilter(ch.id)}>
            <Avatar src={ch.avatar} name={ch.fullName} size={48} />
            <span className="w-16 truncate text-[11px]">{ch.fullName}</span>
          </button>
        ))}
      </div>
      <h2 className="mb-3 text-lg font-semibold">Today</h2>
      <VideoGrid videos={list} loading={videos.isLoading} />
    </div>
  );
}
