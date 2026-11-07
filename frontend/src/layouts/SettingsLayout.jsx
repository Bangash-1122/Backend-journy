import { Outlet, useSearchParams } from 'react-router-dom';
import { SETTINGS_NAV } from '@/lib/constants';

export default function SettingsLayout() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'account';

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-56">
        <h1 className="mb-3 text-2xl font-bold">Settings</h1>
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          {SETTINGS_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setParams({ tab: item.id })}
              className={`h-10 rounded-xl px-3 text-left text-sm ${tab === item.id ? 'bg-elevated font-semibold' : 'hover:bg-surface'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
