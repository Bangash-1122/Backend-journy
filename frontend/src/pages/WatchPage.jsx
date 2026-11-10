import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { Share2, ThumbsDown, ThumbsUp, ListPlus, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { useVideo, useRelatedVideos, useToggleLike } from '@/hooks/useVideos';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import { useUiStore } from '@/store/uiStore';
import { formatViews, timeAgo } from '@/lib/format';
import VideoPlayer from '@/components/video/VideoPlayer';
import CommentSection from '@/components/video/CommentSection';
import UpNextList from '@/components/video/UpNextList';
import Avatar from '@/components/ui/Avatar';
import SubscribeButton from '@/components/channel/SubscribeButton';
import ErrorState from '@/components/feedback/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { LOCAL_HISTORY_KEY, WATCH_LATER_KEY } from '@/lib/constants';
import { readJson, writeJson } from '@/lib/storage';

export default function WatchPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoQuery = useVideo(videoId);
  const relatedQuery = useRelatedVideos(videoId);
  const like = useToggleLike();
  const user = useAuthStore((s) => s.user);
  const autoplay = usePlayerStore((s) => s.autoplay);
  const setAutoplay = usePlayerStore((s) => s.setAutoplay);
  const openModal = useUiStore((s) => s.openModal);
  const [expanded, setExpanded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const video = videoQuery.data;
  const upNext = (relatedQuery.data || []).filter((v) => v.id !== videoId);

  if (videoQuery.isLoading) {
    return <Skeleton className="aspect-video w-full" />;
  }
  if (videoQuery.isError || !video) {
    return <ErrorState error={videoQuery.error || { message: 'Video not found' }} onRetry={videoQuery.refetch} />;
  }

  const history = readJson(LOCAL_HISTORY_KEY, []);
  if (!history.includes(video.id)) writeJson(LOCAL_HISTORY_KEY, [video.id, ...history].slice(0, 100));

  const shareUrl = window.location.href;

  return (
    <div className={`flex flex-col gap-6 lg:flex-row ${usePlayerStore.getState().theatreMode ? 'lg:block' : ''}`}>
      <div className="min-w-0 flex-1">
        <VideoPlayer
          key={video.id}
          videoId={video.id}
          src={video.videoFile}
          poster={video.thumbnail}
          onEnded={() => {
            if (autoplay && upNext[0]) navigate(`/watch/${upNext[0].id}`);
          }}
        />
        <h1 className="mt-4 text-xl font-bold leading-[26px]">{video.title}</h1>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(`/channel/${video.owner?.username}`)}>
              <Avatar src={video.owner?.avatar} name={video.owner?.fullName} size={48} />
            </button>
            <div>
              <p className="font-semibold">{video.owner?.fullName}</p>
              <p className="text-xs text-muted">{formatViews(video.views)} views • {timeAgo(video.createdAt)}</p>
            </div>
            <SubscribeButton channelId={video.owner?.id} subscribed={Boolean(video.owner?.isSubscribed)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-full border border-border bg-surface">
              <button
                className={`inline-flex h-10 items-center gap-2 px-4 text-sm transition-colors ${
                  video.isLiked ? 'text-brand font-bold' : 'hover:bg-elevated'
                }`}
                onClick={async () => {
                  if (!user) return toast.warning('You must sign in to like');
                  try {
                    await like.mutateAsync(video.id);
                  } catch {
                    toast.error('Could not update like');
                  }
                }}
              >
                <ThumbsUp size={18} fill={video.isLiked ? 'currentColor' : 'none'} />
                {formatViews(video.likes || 0)}
              </button>
              <span className="w-px bg-border" />
              <button className="inline-flex h-10 items-center gap-2 px-4 text-sm hover:bg-elevated" onClick={() => toast.info('Dislike is local-only in this backend')}>
                <ThumbsDown size={18} />
              </button>
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm" onClick={() => setShareOpen(true)}>
              <Share2 size={16} /> Share
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm"
              onClick={() => {
                if (!user) return toast.warning('Please sign in to continue');
                openModal('add-to-playlist', { videoId: video.id });
                const later = readJson(WATCH_LATER_KEY, []);
                if (!later.includes(video.id)) writeJson(WATCH_LATER_KEY, [video.id, ...later]);
              }}
            >
              <ListPlus size={16} /> Save
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm" onClick={() => toast.info('Report is not available yet')}>
              <Flag size={16} /> Report
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-surface p-4">
          <p className={expanded ? 'text-sm' : 'line-clamp-3 text-sm'}>{video.description}</p>
          <button className="mt-2 text-sm font-semibold" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Show less' : 'Show more'}
          </button>
        </div>
        <CommentSection videoId={video.id} />
      </div>
      <UpNextList videos={upNext} autoplay={autoplay} onAutoplay={setAutoplay} />
      <Modal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Share"
        footer={
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(shareUrl);
              toast.success('Link copied to clipboard');
            }}
          >
            Copy
          </Button>
        }
      >
        <input readOnly value={shareUrl} className="h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm" />
      </Modal>
    </div>
  );
}
