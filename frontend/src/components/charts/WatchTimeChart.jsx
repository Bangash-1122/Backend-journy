import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function WatchTimeChart({ data }) {
  const chartData = Array.isArray(data) ? data : [];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
        <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
        <YAxis stroke="var(--muted)" fontSize={12} />
        <Tooltip contentStyle={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }} />
        <Area type="monotone" dataKey="watchMinutes" stroke="#22C55E" fill="#22C55E33" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
