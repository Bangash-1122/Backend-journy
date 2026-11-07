import { Link } from 'react-router-dom';
import { formatDuration, formatViews } from '@/lib/format';

export default function UpNextList({ videos = [], autoplay, onAutoplay }) {
  return (
    <aside className="w-full lg:w-[360px] shrink-0">
      <label className="mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold">Up next</span>
        <span className="flex items-center gap-2 text-muted">
          Autoplay
          <input type="checkbox" checked={autoplay} onChange={(e) => onAutoplay(e.target.checked)} />
        </span>
      </label>
      <div className="space-y-3">
        {videos.map((video) => (
          <Link key={video.id} to={`/watch/${video.id}`} className="flex gap-2">
            <div className="relative w-[168px] shrink-0 overflow-hidden rounded-lg">
              <img src={video.thumbnail} alt={`Thumbnail for ${video.title}`} className="aspect-video w-full object-cover" />
              <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[11px] font-bold text-white">
                {formatDuration(video.duration)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-semibold">{video.title}</p>
              <p className="mt-1 text-xs text-muted">{video.owner?.fullName}</p>
              <p className="text-xs text-muted">{formatViews(video.views)} views</p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
