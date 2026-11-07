import { Link } from 'react-router-dom';
import { ListVideo } from 'lucide-react';
import { timeAgo } from '@/lib/format';

export default function PlaylistCard({ playlist, onMenu }) {
  const cover = playlist.videos?.[0]?.thumbnail;
  return (
    <article className="group relative">
      <Link to={`/playlist/${playlist.id}`}>
        <div className="relative overflow-hidden rounded-xl bg-surface">
          {cover ? (
            <img src={cover} alt={`Thumbnail for ${playlist.name}`} className="aspect-video w-full object-cover" />
          ) : (
            <div className="aspect-video grid place-items-center text-muted">
              <ListVideo />
            </div>
          )}
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs font-bold text-white">
            {playlist.videos?.length || 0} videos
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-semibold">{playlist.name}</h3>
        <p className="text-[13px] text-muted">
          {playlist.visibility || 'Public'} • Updated {timeAgo(playlist.updatedAt)}
        </p>
      </Link>
      {onMenu ? (
        <button type="button" className="absolute right-0 top-[calc(56.25%+8px)] text-sm text-muted" onClick={onMenu}>
          ⋯
        </button>
      ) : null}
    </article>
  );
}
