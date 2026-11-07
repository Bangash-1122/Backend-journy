export default function TextAreaField({ label, error, rows = 4, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium">{label}</span> : null}
      <textarea
        rows={rows}
        className={`w-full rounded-lg border bg-surface px-3 py-2 text-sm placeholder:text-muted ${
          error ? 'border-danger' : 'border-border'
        }`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}
