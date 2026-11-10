import { Maximize, Minimize, Pause, Play, Volume2, VolumeX, PictureInPicture2 } from 'lucide-react';
import { formatDuration } from '@/lib/format';

export default function PlayerControls({
  playing,
  muted,
  volume,
  rate,
  current,
  duration,
  theatre,
  isFullscreen,
  supportsPiP,
  isPiP,
  onPlay,
  onSeek,
  onMute,
  onVolume,
  onRate,
  onTheatre,
  onFullscreen,
  onTogglePiP,
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 text-white transition-opacity duration-300">
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={current}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="w-full accent-brand h-1 cursor-pointer hover:h-1.5 transition-all"
        aria-label="Seek video position"
      />
      <div className="mt-1 flex items-center gap-2 text-sm">
        <button
          onClick={onPlay}
          className="size-10 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
          aria-label={playing ? 'Pause (k or Space)' : 'Play (k or Space)'}
          title={playing ? 'Pause (k)' : 'Play (k)'}
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          onClick={onMute}
          className="size-10 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
          aria-label={muted ? 'Unmute (m)' : 'Mute (m)'}
          title={muted ? 'Unmute (m)' : 'Mute (m)'}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={muted ? 0 : volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className="w-20 accent-white h-1 cursor-pointer"
          aria-label="Volume"
        />
        <span className="text-xs font-medium text-white/90">
          {formatDuration(current)} / {formatDuration(duration)}
        </span>
        <span className="ml-auto flex items-center gap-1">
          <select
            value={rate}
            onChange={(e) => onRate(Number(e.target.value))}
            className="rounded bg-transparent px-1.5 py-1 text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors cursor-pointer outline-none"
            aria-label="Playback speed"
            title="Playback speed"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r} className="text-black bg-white">
                {r}x
              </option>
            ))}
          </select>
          {supportsPiP ? (
            <button
              onClick={onTogglePiP}
              className={`size-10 grid place-items-center rounded-full hover:bg-white/10 transition-colors ${isPiP ? 'text-brand' : ''}`}
              aria-label="Picture in Picture (p)"
              title="Picture in Picture (p)"
            >
              <PictureInPicture2 size={18} />
            </button>
          ) : null}
          <button
            onClick={onTheatre}
            className="hidden md:grid size-10 place-items-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Theatre mode (t)"
            title="Theatre mode (t)"
          >
            {theatre ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button
            onClick={onFullscreen}
            className="size-10 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fullscreen (f)"
            title="Fullscreen (f)"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </span>
      </div>
    </div>
  );
}
