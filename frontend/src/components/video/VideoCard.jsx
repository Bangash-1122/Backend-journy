import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatDuration, formatViews, timeAgo } from '@/lib/format';
import Avatar from '@/components/ui/Avatar';
import { queryKeys } from '@/lib/queryKeys';
import { fetchVideoById } from '@/services/videos.service';
import { useQueryClient } from '@tanstack/react-query';

export default function VideoCard({ video, index = 0 }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  if (!video) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.18 }}
      className="group"
      onMouseEnter={() => {
        qc.prefetchQuery({ queryKey: queryKeys.videos.detail(video.id), queryFn: () => fetchVideoById(video.id) });
      }}
    >
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => navigate(`/watch/${video.id}`)}
      >
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={video.thumbnail}
            alt={`Thumbnail for ${video.title}`}
            width={640}
            height={360}
            loading="lazy"
            className="aspect-video w-full object-cover transition-transform duration-180 group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-bold text-white">
            {formatDuration(video.duration)}
          </span>
        </div>
      </button>
      <div className="mt-3 flex gap-3">
        <Link to={`/channel/${video.owner?.username}`}>
          <Avatar src={video.owner?.avatar} name={video.owner?.fullName} size={36} />
        </Link>
        <div className="min-w-0">
          <Link to={`/watch/${video.id}`} className="line-clamp-2 text-base font-semibold leading-[22px] group-hover:underline">
            {video.title}
          </Link>
          <Link to={`/channel/${video.owner?.username}`} className="mt-1 block truncate text-[13px] text-muted">
            {video.owner?.fullName}
          </Link>
          <p className="text-[13px] text-muted">
            {formatViews(video.views)} views • {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
