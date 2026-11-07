export default function ChartCard({ title, subtitle, badge, children }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {subtitle ? <p className="text-[13px] text-muted">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      {children}
      <p className="mt-2 text-xs text-muted">Last updated just now</p>
    </section>
  );
}
