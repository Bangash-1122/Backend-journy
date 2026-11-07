import { Link } from 'react-router-dom';
import { formatDuration } from '@/lib/format';
import { X } from 'lucide-react';

export default function PlaylistRow({ video, index, active, onRemove }) {
  if (!video?.title) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted">
        {index + 1}. Video unavailable
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 px-3 py-2 ${active ? 'bg-elevated' : 'hover:bg-surface'}`}>
      <span className="w-6 text-xs text-muted">{index + 1}</span>
      <Link to={`?v=${video.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative w-[120px] shrink-0 overflow-hidden rounded-md">
          <img src={video.thumbnail} alt="" className="aspect-video w-full object-cover" />
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-semibold">{video.title}</p>
          <p className="text-xs text-muted">{video.owner?.fullName}</p>
        </div>
      </Link>
      {onRemove ? (
        <button type="button" aria-label="Remove from playlist" onClick={() => onRemove(video.id)} className="size-11 grid place-items-center">
          <X size={16} />
        </button>
      ) : null}
    </div>
  );
}
