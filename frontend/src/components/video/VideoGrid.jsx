import VideoCard from './VideoCard';
import VideoSkeleton from './VideoSkeleton';

export default function VideoGrid({ videos = [], loading, count = 8 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.map((video, i) => (
        <VideoCard key={`${video.id || video._id || i}-${i}`} video={video} index={i} />
      ))}
    </div>
  );
}
