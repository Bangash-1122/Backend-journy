export default function Button({
  children,
  variant = 'primary',
  className = '',
  loading = false,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold rounded-full transition-transform disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    secondary: 'bg-surface text-text border border-border hover:bg-elevated',
    ghost: 'bg-transparent text-text hover:bg-surface',
    danger: 'bg-danger text-white hover:opacity-90',
  };
  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <span className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : null}
      {loading ? 'Loading…' : children}
    </button>
  );
}
