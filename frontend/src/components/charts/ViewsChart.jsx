import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ViewsChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
        <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}K`} stroke="var(--muted)" fontSize={12} />
        <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }} />
        <Line type="monotone" dataKey="views" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
