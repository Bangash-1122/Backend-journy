import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm';
import { useAuthStore } from '@/store/authStore';
import { useStudioVideos } from '@/hooks/useStudio';
import { useDeleteVideo, useTogglePublish } from '@/hooks/useVideos';
import EmptyState from '@/components/feedback/EmptyState';
import { formatViews, timeAgo } from '@/lib/format';

export default function StudioVideos() {
  const user = useAuthStore((s) => s.user);
  const query = useStudioVideos(user?.id);
  const remove = useDeleteVideo();
  const publish = useTogglePublish();
  const videos = query.data || [];

  if (!query.isLoading && !videos.length) {
    return <EmptyState icon={Upload} title="No videos yet" description="Upload your first video." actionLabel="Upload" onAction={() => (window.location.href = '/upload')} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Videos</h1>
        <Link to="/upload" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          Upload
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-3">Video</th>
              <th className="p-3">Visibility</th>
              <th className="p-3">Views</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} className="border-t border-border">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={v.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />
                    <span className="line-clamp-2 max-w-xs font-medium">{v.title}</span>
                  </div>
                </td>
                <td className="p-3">{v.isPublished ? 'Public' : 'Private'}</td>
                <td className="p-3">{formatViews(v.views)}</td>
                <td className="p-3">{timeAgo(v.createdAt)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Link to={`/studio/videos/${v.id}`} className="text-info">
                      Edit
                    </Link>
                    <button
                      className="text-muted"
                      onClick={async () => {
                        await publish.mutateAsync(v.id);
                        toast.success('Visibility updated');
                      }}
                    >
                      Toggle
                    </button>
                    <button
                      className="text-danger"
                      onClick={async () => {
                        if (await confirmDelete({ title: 'Delete this video?', text: 'This cannot be undone.' })) {
                          await remove.mutateAsync(v.id);
                          toast.success('Video deleted');
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
