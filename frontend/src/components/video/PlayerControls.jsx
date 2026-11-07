import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '@/lib/format';

export default function PlayerControls({
  playing,
  muted,
  volume,
  rate,
  current,
  duration,
  theatre,
  onPlay,
  onSeek,
  onMute,
  onVolume,
  onRate,
  onTheatre,
  onFullscreen,
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-10 text-white">
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={current}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="w-full accent-brand"
        aria-label="Seek"
      />
      <div className="mt-1 flex items-center gap-2 text-sm">
        <button onClick={onPlay} className="size-11 grid place-items-center" aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={onMute} className="size-11 grid place-items-center" aria-label="Mute">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input type="range" min="0" max="1" step="0.05" value={muted ? 0 : volume} onChange={(e) => onVolume(Number(e.target.value))} className="w-20 accent-white" aria-label="Volume" />
        <span className="text-xs">
          {formatDuration(current)} / {formatDuration(duration)}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <select value={rate} onChange={(e) => onRate(Number(e.target.value))} className="bg-transparent text-xs" aria-label="Playback speed">
            {[0.5, 1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r} className="text-black">
                {r}x
              </option>
            ))}
          </select>
          <button onClick={onTheatre} className="hidden md:grid size-11 place-items-center" aria-label="Theatre mode">
            {theatre ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button onClick={onFullscreen} className="size-11 grid place-items-center" aria-label="Fullscreen">
            <Maximize size={18} />
          </button>
        </span>
      </div>
    </div>
  );
}
