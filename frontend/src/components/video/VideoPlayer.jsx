import { useEffect, useRef, useState } from 'react';
import PlayerControls from './PlayerControls';
import Spinner from '@/components/ui/Spinner';
import { usePlayerStore } from '@/store/playerStore';

export default function VideoPlayer({ src, poster, onEnded }) {
  const ref = useRef(null);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);
  const playing = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const rate = usePlayerStore((s) => s.playbackRate);
  const current = usePlayerStore((s) => s.currentTime);
  const theatre = usePlayerStore((s) => s.theatreMode);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMuted = usePlayerStore((s) => s.toggleMuted);
  const setPlaybackRate = usePlayerStore((s) => s.setPlaybackRate);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const toggleTheatre = usePlayerStore((s) => s.toggleTheatre);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
    el.playbackRate = rate;
  }, [volume, muted, rate]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playing) el.play().catch(() => setPlaying(false));
    else el.pause();
  }, [playing, setPlaying]);

  if (error) {
    return (
      <div className="aspect-video grid place-items-center rounded-xl bg-black text-white">
        Video unavailable
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${theatre ? 'lg:rounded-none' : ''}`}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        className="aspect-video w-full"
        onClick={() => setPlaying(!playing)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={onEnded}
        onError={() => setError(true)}
      />
      {buffering ? (
        <div className="absolute inset-0 grid place-items-center">
          <Spinner />
        </div>
      ) : null}
      <PlayerControls
        playing={playing}
        muted={muted}
        volume={volume}
        rate={rate}
        current={current}
        duration={duration}
        theatre={theatre}
        onPlay={() => setPlaying(!playing)}
        onSeek={(t) => {
          if (ref.current) ref.current.currentTime = t;
          setCurrentTime(t);
        }}
        onMute={toggleMuted}
        onVolume={setVolume}
        onRate={setPlaybackRate}
        onTheatre={toggleTheatre}
        onFullscreen={() => ref.current?.parentElement?.requestFullscreen?.()}
      />
    </div>
  );
}
