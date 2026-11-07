import { BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import SubscribeButton from './SubscribeButton';
import { formatViews } from '@/lib/format';

export default function ChannelHeader({ channel, isOwner }) {
  if (!channel) return null;
  return (
    <div>
      {channel.coverImage ? (
        <img src={channel.coverImage} alt="" className="h-32 w-full rounded-xl object-cover sm:h-44 md:aspect-[16/4] md:h-auto" />
      ) : (
        <div className="h-32 rounded-xl bg-surface sm:h-44" />
      )}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <Avatar src={channel.avatar} name={channel.fullName} size={80} className="-mt-12 border-4 border-bg sm:size-20" />
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold leading-[30px]">
            {channel.fullName}
            {channel.verified ? <BadgeCheck className="text-info" size={18} /> : null}
          </h1>
          <p className="text-sm text-muted">
            @{channel.username} • {formatViews(channel.subscribersCount)} subscribers
          </p>
          {channel.description ? <p className="mt-2 line-clamp-3 max-w-2xl text-sm text-muted">{channel.description}</p> : null}
        </div>
        {isOwner ? (
          <Link to="/settings?tab=channel">
            <Button variant="secondary">Edit channel</Button>
          </Link>
        ) : (
          <SubscribeButton channelId={channel.id} subscribed={channel.isSubscribed} />
        )}
      </div>
    </div>
  );
}
