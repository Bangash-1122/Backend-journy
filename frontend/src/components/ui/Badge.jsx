export default function Badge({ children, tone = 'muted', className = '' }) {
  const tones = {
    muted: 'bg-surface text-muted border-border',
    brand: 'bg-brand-soft text-brand',
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
