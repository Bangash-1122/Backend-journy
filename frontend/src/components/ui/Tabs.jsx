export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`h-11 px-4 text-sm shrink-0 border-b-2 ${
            value === tab.id ? 'border-text font-semibold text-text' : 'border-transparent text-muted hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
