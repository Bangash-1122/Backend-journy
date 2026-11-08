import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useStudioStats, useStudioVideos, useStudioAnalytics } from '@/hooks/useStudio';
import { formatViews } from '@/lib/format';
import ChartCard from '@/components/charts/ChartCard';
import ViewsChart from '@/components/charts/ViewsChart';
import Skeleton from '@/components/ui/Skeleton';
import Badge from '@/components/ui/Badge';

export default function StudioDashboard() {
  const user = useAuthStore((s) => s.user);
  const stats = useStudioStats(user?.id);
  const videos = useStudioVideos(user?.id);
  const analytics = useStudioAnalytics('7D');
  const s = stats.data || {};
  const chartPoints = Array.isArray(analytics.data?.points) ? analytics.data.points : [];

  const cards = [
    { label: 'Views', value: formatViews(s.totalVideoViews ?? 0) },
    { label: 'Subscribers', value: formatViews(s.totalSubscribers ?? 0) },
    { label: 'Total Likes', value: formatViews(s.totalLikeCount ?? 0) },
    { label: 'Videos', value: s.totalVideos ?? 0 },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Studio</h1>
        <Link to="/upload" className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          Upload
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : cards.map((c) => (
              <div key={c.label} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-sm text-muted">{c.label}</p>
                <p className="mt-2 text-2xl font-bold">{c.value}</p>
              </div>
            ))}
      </div>
      <div className="mt-6">
        <ChartCard title="Views" subtitle="Last 7 days" badge={<Badge tone="warning">Sample data</Badge>}>
          {analytics.isLoading ? <Skeleton className="h-[280px]" /> : <ViewsChart data={chartPoints} />}
        </ChartCard>
      </div>
      <h2 className="mt-8 mb-3 text-lg font-semibold">Recent videos</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-3">Video</th>
              <th className="p-3">Visibility</th>
              <th className="p-3">Views</th>
            </tr>
          </thead>
          <tbody>
            {(videos.data || []).slice(0, 6).map((v) => (
              <tr key={v.id} className="border-t border-border">
                <td className="p-3">
                  <Link to={`/studio/videos/${v.id}`} className="flex items-center gap-3">
                    <img src={v.thumbnail} alt="" className="h-12 w-20 rounded object-cover" />
                    {v.title}
                  </Link>
                </td>
                <td className="p-3">{v.isPublished ? 'Public' : 'Private'}</td>
                <td className="p-3">{formatViews(v.views)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
