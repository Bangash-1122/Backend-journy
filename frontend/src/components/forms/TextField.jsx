export default function TextField({ label, error, type = 'text', className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      {label ? <span className="mb-1.5 block text-sm font-medium">{label}</span> : null}
      <input
        type={type}
        className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm placeholder:text-muted ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}
