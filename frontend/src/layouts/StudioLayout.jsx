import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Settings, Video } from 'lucide-react';
import Header from '@/components/layout/Header';

const items = [
  { to: '/studio', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/studio/videos', label: 'Videos', icon: Video },
  { to: '/studio/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function StudioLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <div className="flex">
        <aside className="hidden md:block w-[240px] border-r border-border p-3">
          <p className="px-3 py-2 text-xs font-semibold text-muted">Creator Studio</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 h-10 text-sm ${isActive ? 'bg-elevated font-semibold' : 'hover:bg-surface'}`
                }
              >
                <Icon size={18} /> {item.label}
              </NavLink>
            );
          })}
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className="rounded-full border border-border px-3 py-1 text-sm">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
