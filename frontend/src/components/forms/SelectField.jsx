export default function SelectField({ label, error, children, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-sm font-medium">{label}</span> : null}
      <select
        className={`h-10 w-full rounded-lg border bg-surface px-3 text-sm ${error ? 'border-danger' : 'border-border'}`}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}
