import { useEffect, useRef, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Disc,
  X,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { toast } from 'sonner';
import { useShorts, useToggleLike } from '@/hooks/useVideos';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { env } from '@/lib/env';
import Avatar from '@/components/ui/Avatar';
import SubscribeButton from '@/components/channel/SubscribeButton';
import CommentSection from '@/components/video/CommentSection';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/feedback/EmptyState';
import { formatViews } from '@/lib/format';

function ShortItem({
  short,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
}) {
  const videoRef = useRef(null);
  const likeBtnRef = useRef(null);
  const heartRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const likeMutation = useToggleLike();
  const user = useAuthStore((s) => s.user);
  const playPromiseRef = useRef(null);

  // Play / Pause safely without null pointer exceptions
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
      el.muted = isMuted;
      const promise = el.play();
      playPromiseRef.current = promise;
      if (promise && typeof promise.then === 'function') {
        promise
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (!el.muted) {
              el.muted = true;
              const retryPromise = el.play();
              playPromiseRef.current = retryPromise;
              if (retryPromise && typeof retryPromise.then === 'function') {
                retryPromise
                  .then(() => setIsPlaying(true))
                  .catch(() => setIsPlaying(false));
              }
            } else {
              setIsPlaying(false);
            }
          });
      }
    } else {
      const curPromise = playPromiseRef.current;
      if (curPromise && typeof curPromise.finally === 'function') {
        curPromise.finally(() => {
          el.pause();
          el.currentTime = 0;
          setIsPlaying(false);
          setProgress(0);
        });
      } else {
        el.pause();
        el.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
      }
    }
  }, [isActive, isMuted]);

  // Sync mute state on prop change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      el.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (el && el.duration) {
      setProgress((el.currentTime / el.duration) * 100);
    }
  };

  const handleLike = async (e) => {
    e?.stopPropagation();
    if (!user) {
      if (env.enableMock) {
        useAuthStore.getState().login(
          { id: 'u-demo', username: 'videohub', fullName: 'VideoHub Demo', avatar: 'https://i.pravatar.cc/160?img=12' },
          'demo-token',
          'demo-refresh',
        );
      } else {
        toast.warning('Sign in to like shorts');
        return;
      }
    }

    // GSAP Button Pop Animation
    if (likeBtnRef.current) {
      gsap.timeline()
        .to(likeBtnRef.current, { scale: 0.8, rotate: -20, duration: 0.1 })
        .to(likeBtnRef.current, { scale: 1.3, rotate: 10, duration: 0.2, ease: 'back.out(3)' })
        .to(likeBtnRef.current, { scale: 1, rotate: 0, duration: 0.15 });
    }

    try {
      await likeMutation.mutateAsync(short.id);
    } catch {
      toast.error('Could not like short');
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setShowHeart(true);
    if (heartRef.current) {
      gsap.timeline()
        .fromTo(heartRef.current, { scale: 0, opacity: 0, rotate: -20 }, { scale: 1.4, opacity: 1, rotate: 0, duration: 0.3, ease: 'back.out(2)' })
        .to(heartRef.current, { scale: 2, opacity: 0, duration: 0.3, delay: 0.3, onComplete: () => setShowHeart(false) });
    } else {
      setTimeout(() => setShowHeart(false), 900);
    }
    if (!short.isLiked) {
      handleLike();
    }
  };

  const handleShare = async (e) => {
    e?.stopPropagation();
    const url = `${window.location.origin}/shorts?id=${short.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: short.title, url });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="relative flex h-full w-full snap-start snap-always items-center justify-center p-2 sm:p-4">
      <div className="relative flex h-full max-h-[780px] w-full max-w-[440px] items-end justify-center overflow-hidden rounded-2xl bg-black shadow-2xl border border-border/40">
        {/* Video Surface */}
        <div
          className="relative h-full w-full cursor-pointer select-none"
          onClick={togglePlay}
          onDoubleClick={handleDoubleClick}
        >
          <video
            ref={videoRef}
            src={short.videoFile}
            poster={short.thumbnail}
            loop
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="h-full w-full object-cover"
          />

          {/* Double Tap Heart Animation with GSAP */}
          <AnimatePresence>
            {showHeart && (
              <div
                ref={heartRef}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <ThumbsUp size={90} className="fill-brand text-brand drop-shadow-2xl" />
              </div>
            )}
          </AnimatePresence>

          {/* Play / Pause Flash Indicator */}
          {!isPlaying && isActive && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="rounded-full bg-black/60 p-4 text-white backdrop-blur-sm">
                <Play size={36} className="fill-white translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Sound Toggle (Top Right of Player) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="absolute top-4 right-4 z-20 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
            title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Gradient Overlay for Text Readability */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Creator Info & Description Overlay (Bottom Left) */}
          <div className="absolute inset-x-0 bottom-3 z-10 flex flex-col gap-2.5 p-4 text-white">
            <div className="flex items-center gap-3">
              <Link
                to={`/channel/${short.owner?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 hover:opacity-90"
              >
                <Avatar
                  src={short.owner?.avatar}
                  name={short.owner?.fullName || short.owner?.username}
                  size={38}
                  className="border-2 border-white/60"
                />
                <span className="font-semibold text-sm drop-shadow-md">
                  @{short.owner?.username}
                </span>
              </Link>
              {short.owner?.id && (
                <div onClick={(e) => e.stopPropagation()}>
                  <SubscribeButton
                    channelId={short.owner.id}
                    subscribed={Boolean(short.owner?.isSubscribed)}
                  />
                </div>
              )}
            </div>

            <div className="max-w-[85%]">
              <p
                onClick={(e) => {
                  e.stopPropagation();
                  setDescExpanded((v) => !v);
                }}
                className={`text-xs sm:text-sm drop-shadow-md cursor-pointer ${
                  descExpanded ? '' : 'line-clamp-2'
                }`}
              >
                <span className="font-medium mr-1">{short.title}</span>
                {short.description && short.description !== short.title && (
                  <span className="text-white/80">{short.description}</span>
                )}
              </p>
            </div>

            {/* Audio / Music pill */}
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Disc size={13} className="animate-spin text-brand" style={{ animationDuration: '4s' }} />
              <span className="truncate max-w-[200px]">
                Original Audio • {short.owner?.fullName || short.owner?.username}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div
              className="h-full bg-brand transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action Rail (Right Side) */}
        <div className="absolute right-3 bottom-16 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like Button */}
          <button
            ref={likeBtnRef}
            type="button"
            onClick={handleLike}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`flex size-11 items-center justify-center rounded-full backdrop-blur-md transition-all group-hover:scale-110 active:scale-95 ${
                short.isLiked ? 'bg-brand text-white shadow-lg shadow-brand/40' : 'bg-black/50 text-white hover:bg-black/70'
              }`}
            >
              <ThumbsUp size={20} fill={short.isLiked ? 'currentColor' : 'none'} />
            </div>
            <span className="text-[11px] font-semibold drop-shadow-md">
              {formatViews(short.likes || 0)}
            </span>
          </button>

          {/* Comments Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments(short);
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all group-hover:scale-110 active:scale-95 hover:bg-black/70">
              <MessageSquare size={20} />
            </div>
            <span className="text-[11px] font-semibold drop-shadow-md">Comments</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-all group-hover:scale-110 active:scale-95 hover:bg-black/70">
              <Share2 size={20} />
            </div>
            <span className="text-[11px] font-semibold drop-shadow-md">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShortsPage() {
  const [searchParams] = useSearchParams();
  const query = useShorts({ limit: 10 });
  const [activeIndex, setActiveIndex] = useState(0);
  const isMuted = usePlayerStore((s) => s.muted);
  const toggleMuted = usePlayerStore((s) => s.toggleMuted);
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeCommentShort, setActiveCommentShort] = useState(null);

  const shorts = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  // Scroll to targeted short if ?id= is in URL on load
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId && shorts.length > 0) {
      const idx = shorts.findIndex((s) => s.id === targetId || s._id === targetId);
      if (idx !== -1 && itemRefs.current[idx]) {
        itemRefs.current[idx].scrollIntoView({ behavior: 'smooth' });
        setActiveIndex(idx);
      }
    }
  }, [searchParams, shorts]);

  // Viewport IntersectionObserver to track active short
  useEffect(() => {
    const container = containerRef.current;
    if (!container || shorts.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!Number.isNaN(index)) {
              setActiveIndex(index);
              // Trigger infinite loading if near end
              if (index >= shorts.length - 2 && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.6,
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [shorts.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Keyboard navigation: ArrowUp, ArrowDown, Space, m
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        if (activeIndex < shorts.length - 1) {
          itemRefs.current[activeIndex + 1]?.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        if (activeIndex > 0) {
          itemRefs.current[activeIndex - 1]?.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMuted();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, shorts.length, toggleMuted]);

  if (query.isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center p-4">
        <Skeleton className="h-full max-h-[780px] w-full max-w-[440px] rounded-2xl" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <EmptyState
          icon={Sparkles}
          title="No Shorts yet"
          description="Be the first to upload a vertical short (under 60s)!"
          actionLabel="Upload Short"
          onAction={() => (window.location.href = '/upload')}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-4.25rem)] w-full justify-center overflow-hidden">
      {/* Scrollable Snap Reel Container */}
      <div
        ref={containerRef}
        className="h-full w-full max-w-[500px] snap-y snap-mandatory overflow-y-scroll scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {shorts.map((short, idx) => (
          <div
            key={`${short.id || short._id}-${idx}`}
            data-index={idx}
            ref={(el) => (itemRefs.current[idx] = el)}
            className="h-full w-full"
          >
            <ShortItem
              short={short}
              isActive={activeIndex === idx}
              isMuted={isMuted}
              onToggleMute={toggleMuted}
              onOpenComments={setActiveCommentShort}
            />
          </div>
        ))}
      </div>

      {/* Slide-over Comments Drawer */}
      <AnimatePresence>
        {activeCommentShort && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="flex h-full w-full max-w-md flex-col bg-bg border-l border-border shadow-2xl p-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-base font-bold">Comments</h3>
                <button
                  type="button"
                  onClick={() => setActiveCommentShort(null)}
                  className="rounded-full p-1.5 hover:bg-surface text-muted hover:text-text transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                <CommentSection videoId={activeCommentShort.id} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
