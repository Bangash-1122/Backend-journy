import { NavLink } from 'react-router-dom';
import { Home, Library, Plus, Search, Users } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/upload', label: 'Upload', icon: Plus, center: true },
  { to: '/subscriptions', label: 'Subscriptions', icon: Users },
  { to: '/library', label: 'Library', icon: Library },
];

export default function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex h-14 items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        if (item.center) {
          return (
            <NavLink key={item.to} to={item.to} aria-label={item.label} className="grid size-11 place-items-center rounded-full bg-brand text-white -mt-4">
              <Icon size={22} />
            </NavLink>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 text-[11px] ${isActive ? 'text-brand' : 'text-muted'}`}
          >
            <Icon size={20} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
