import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, VolumeX } from 'lucide-react';
import PlayerControls from './PlayerControls';
import Spinner from '@/components/ui/Spinner';
import { usePlayerStore } from '@/store/playerStore';

export default function VideoPlayer({ src, poster, videoId, onEnded }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const playPromiseRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [showUnmutePrompt, setShowUnmutePrompt] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [supportsPiP] = useState(() => typeof document !== 'undefined' && Boolean(document.pictureInPictureEnabled));

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

  // Sync volume, muted, and playback rate to video element safely
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
    el.playbackRate = rate;
  }, [volume, muted, rate]);

  // Safe play handling: awaits active promise before attempting new playback or pause
  const handlePlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;

    try {
      playPromiseRef.current = el.play();
      await playPromiseRef.current;
      setPlaying(true);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        // Browser autoplay blocked audio: start muted and offer user one-click unmute
        el.muted = true;
        if (!muted) toggleMuted();
        try {
          playPromiseRef.current = el.play();
          await playPromiseRef.current;
          setPlaying(true);
          setShowUnmutePrompt(true);
        } catch {
          setPlaying(false);
        }
      } else if (err.name !== 'AbortError') {
        setPlaying(false);
      }
    } finally {
      playPromiseRef.current = null;
    }
  }, [muted, setPlaying, toggleMuted]);

  const handlePause = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;

    if (playPromiseRef.current) {
      try {
        await playPromiseRef.current;
      } catch {
        // Ignore aborted play promise
      }
    }
    el.pause();
    setPlaying(false);
  }, [setPlaying]);

  const togglePlayPause = useCallback(() => {
    if (playing) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [playing, handlePause, handlePlay]);

  // Synchronize playing store state with video element
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing && el.paused) {
      handlePlay();
    } else if (!playing && !el.paused) {
      handlePause();
    }
  }, [playing, handlePlay, handlePause]);

  // Restore saved playback position on mount / videoId change
  useEffect(() => {
    if (!videoId) return;
    try {
      const saved = Number(localStorage.getItem(`videohub_pos_${videoId}`));
      if (saved && saved > 2 && videoRef.current) {
        videoRef.current.currentTime = saved;
        setCurrentTime(saved);
      }
    } catch {
      // Ignore storage errors
    }
  }, [videoId, setCurrentTime]);

  // Save current playback position
  const handleTimeUpdate = (e) => {
    const t = e.currentTarget.currentTime;
    setCurrentTime(t);
    if (videoId && Math.floor(t) % 5 === 0) {
      try {
        localStorage.setItem(`videohub_pos_${videoId}`, String(Math.floor(t)));
      } catch {
        // Ignore storage errors
      }
    }
  };

  // Fullscreen and PiP state change listeners
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    const onEnterPiP = () => setIsPiP(true);
    const onLeavePiP = () => setIsPiP(false);

    document.addEventListener('fullscreenchange', onFullscreenChange);
    const el = videoRef.current;
    if (el) {
      el.addEventListener('enterpictureinpicture', onEnterPiP);
      el.addEventListener('leavepictureinpicture', onLeavePiP);
    }

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (el) {
        el.removeEventListener('enterpictureinpicture', onEnterPiP);
        el.removeEventListener('leavepictureinpicture', onLeavePiP);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const togglePiP = useCallback(async () => {
    const el = videoRef.current;
    if (!el || !supportsPiP) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await el.requestPictureInPicture();
      }
    } catch {
      // PiP not allowed or failed
    }
  }, [supportsPiP]);

  // Activity timer: auto-hide controls after 2.5s of mouse stillness during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Keyboard shortcut controller (YouTube standards)
  useEffect(() => {
    const onKeyDown = (e) => {
      // Ignore key events when user is typing in forms/inputs
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      const key = e.key.toLowerCase();
      const el = videoRef.current;
      if (!el) return;

      if (key === ' ' || key === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (key === 'arrowleft' || key === 'j') {
        e.preventDefault();
        const delta = key === 'j' ? 10 : 5;
        const next = Math.max(0, el.currentTime - delta);
        el.currentTime = next;
        setCurrentTime(next);
      } else if (key === 'arrowright' || key === 'l') {
        e.preventDefault();
        const delta = key === 'l' ? 10 : 5;
        const next = Math.min(el.duration || Infinity, el.currentTime + delta);
        el.currentTime = next;
        setCurrentTime(next);
      } else if (key === 'arrowup') {
        e.preventDefault();
        setVolume(Math.min(1, Number((volume + 0.05).toFixed(2))));
      } else if (key === 'arrowdown') {
        e.preventDefault();
        setVolume(Math.max(0, Number((volume - 0.05).toFixed(2))));
      } else if (key === 'm') {
        e.preventDefault();
        toggleMuted();
      } else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (key === 't') {
        e.preventDefault();
        toggleTheatre();
      } else if (key === 'p') {
        e.preventDefault();
        togglePiP();
      } else if (!isNaN(Number(key)) && el.duration) {
        e.preventDefault();
        const pct = Number(key) * 0.1;
        const next = el.duration * pct;
        el.currentTime = next;
        setCurrentTime(next);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlayPause, volume, setVolume, toggleMuted, toggleTheatre, togglePiP, setCurrentTime]);

  const handleMediaError = (e) => {
    const mediaErr = e.currentTarget.error;
    let message = 'An error occurred while loading this video.';
    if (mediaErr) {
      switch (mediaErr.code) {
        case 1:
          message = 'Playback aborted by user.';
          break;
        case 2:
          message = 'Network error: could not connect to video stream.';
          break;
        case 3:
          message = 'Decoding error: video codec or format is unsupported.';
          break;
        case 4:
          message = 'Video source or format is not supported.';
          break;
        default:
          message = mediaErr.message || message;
      }
    }
    setErrorInfo(message);
  };

  const handleRetry = () => {
    setErrorInfo(null);
    const el = videoRef.current;
    if (el) {
      el.load();
      handlePlay();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      className={`group relative overflow-hidden rounded-xl bg-black select-none ${theatre ? 'lg:rounded-none' : ''}`}
    >
      {errorInfo ? (
        <div className="aspect-video grid place-items-center bg-black/95 p-6 text-center text-white">
          <div className="max-w-md">
            <AlertCircle className="mx-auto mb-3 text-brand" size={44} />
            <h3 className="text-lg font-bold">Playback Error</h3>
            <p className="mt-1 text-sm text-white/70">{errorInfo}</p>
            <button
              onClick={handleRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold hover:bg-brand/90 transition-colors"
            >
              <RefreshCw size={16} /> Retry playback
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            preload="metadata"
            className="aspect-video w-full cursor-pointer object-contain"
            onClick={togglePlayPause}
            onDoubleClick={toggleFullscreen}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => {
              setBuffering(false);
              setPlaying(true);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              onEnded?.();
            }}
            onError={handleMediaError}
          />

          {buffering ? (
            <div className="absolute inset-0 grid place-items-center pointer-events-none bg-black/30">
              <Spinner />
            </div>
          ) : null}

          {showUnmutePrompt ? (
            <button
              onClick={() => {
                toggleMuted();
                setShowUnmutePrompt(false);
              }}
              className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur hover:bg-brand transition-colors"
            >
              <VolumeX size={16} /> Click to unmute
            </button>
          ) : null}

          <div
            className={`transition-opacity duration-300 ${
              showControls || !playing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <PlayerControls
              playing={playing}
              muted={muted}
              volume={volume}
              rate={rate}
              current={current}
              duration={duration}
              theatre={theatre}
              isFullscreen={isFullscreen}
              supportsPiP={supportsPiP}
              isPiP={isPiP}
              onPlay={togglePlayPause}
              onSeek={(t) => {
                if (videoRef.current) videoRef.current.currentTime = t;
                setCurrentTime(t);
              }}
              onMute={toggleMuted}
              onVolume={setVolume}
              onRate={setPlaybackRate}
              onTheatre={toggleTheatre}
              onFullscreen={toggleFullscreen}
              onTogglePiP={togglePiP}
            />
          </div>
        </>
      )}
    </div>
  );
}
