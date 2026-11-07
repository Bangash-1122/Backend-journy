import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useStudioAnalytics, useStudioStats, useStudioVideos } from '@/hooks/useStudio';
import ChartCard from '@/components/charts/ChartCard';
import ViewsChart from '@/components/charts/ViewsChart';
import WatchTimeChart from '@/components/charts/WatchTimeChart';
import SubscribersChart from '@/components/charts/SubscribersChart';
import Chip from '@/components/ui/Chip';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/feedback/EmptyState';
import { formatViews } from '@/lib/format';

const ranges = ['7D', '28D', '90D'];

export default function StudioAnalytics() {
  const [range, setRange] = useState('7D');
  const user = useAuthStore((s) => s.user);
  const stats = useStudioStats(user?.id);
  const analytics = useStudioAnalytics(range);
  const videos = useStudioVideos(user?.id);
  const points = analytics.data?.points || [];
  const s = stats.data || {};

  if (!analytics.isLoading && !points.length) {
    return <EmptyState title="No data yet" description="Publish a video to see analytics." />;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <Chip key={r} active={range === r} onClick={() => setRange(r)}>
              {r}
            </Chip>
          ))}
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Views', formatViews(s.totalVideoViews), '+12%'],
          ['Subscribers', formatViews(s.totalSubscribers), '+4%'],
          ['Watch time', 'Sample', '—'],
          ['Videos', s.totalVideos ?? '—', ''],
        ].map(([label, value, delta]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="text-xs text-success">{delta}</p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <ChartCard title="Views over time" badge={<Badge tone="warning">Sample data — connect backend for real analytics</Badge>}>
          <ViewsChart data={points} />
        </ChartCard>
        <ChartCard title="Watch time">
          <WatchTimeChart data={points} />
        </ChartCard>
        <ChartCard title="Subscribers">
          <SubscribersChart data={points} />
        </ChartCard>
      </div>
      <h2 className="mt-8 mb-3 text-lg font-semibold">Top videos</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-muted">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Video</th>
              <th className="p-3">Views</th>
            </tr>
          </thead>
          <tbody>
            {(videos.data || [])
              .slice()
              .sort((a, b) => b.views - a.views)
              .slice(0, 10)
              .map((v, i) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={v.thumbnail} alt="" className="h-10 w-16 rounded object-cover" />
                      {v.title}
                    </div>
                  </td>
                  <td className="p-3">{formatViews(v.views)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
