export default function Chip({ active, children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`h-8 shrink-0 rounded-full px-3 text-sm border transition-colors ${
        active ? 'bg-text text-bg border-text font-semibold' : 'bg-surface text-text border-border hover:bg-elevated'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
