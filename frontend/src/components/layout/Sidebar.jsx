import { NavLink } from 'react-router-dom';
import { Clock, Flame, Heart, History, Home, ListVideo, UserRound, Users } from 'lucide-react';
import { SIDEBAR_MAIN, SIDEBAR_YOU } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import Avatar from '@/components/ui/Avatar';

const icons = {
  home: Home,
  shorts: Flame,
  subscriptions: Users,
  channel: UserRound,
  history: History,
  later: Clock,
  liked: Heart,
  playlists: ListVideo,
};

export default function Sidebar({ variant = 'desktop' }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed) && variant === 'desktop';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-4 rounded-xl px-3 h-10 text-sm ${
      collapsed ? 'justify-center px-0' : ''
    } ${isActive ? 'bg-elevated font-semibold' : 'hover:bg-surface'}`;

  const Item = ({ item }) => {
    const Icon = icons[item.icon];
    const to = item.to === '/channel/me' ? (user?.username ? `/channel/${user.username}` : '/login') : item.to;
    if (item.auth && !isAuthenticated) return null;
    return (
      <NavLink to={to} className={linkClass} title={item.label} onClick={() => variant === 'drawer' && setSidebarOpen(false)}>
        {({ isActive }) => (
          <>
            {isActive ? <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full bg-brand" /> : null}
            <Icon size={20} />
            {collapsed ? null : item.label}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <nav className={`${collapsed ? 'w-[72px]' : 'w-[240px]'} h-full overflow-y-auto px-2 py-3`}>
      <div className="space-y-1">
        {SIDEBAR_MAIN.map((item) => (
          <Item key={item.to} item={item} />
        ))}
      </div>
      <div className="my-3 border-t border-border" />
      {collapsed ? null : <p className="px-3 pb-2 text-xs font-semibold text-muted">You</p>}
      <div className="space-y-1">
        {SIDEBAR_YOU.map((item) => (
          <Item key={item.to} item={item} />
        ))}
      </div>
      {!collapsed && isAuthenticated ? (
        <>
          <div className="my-3 border-t border-border" />
          <p className="px-3 pb-2 text-xs font-semibold text-muted">Subscriptions</p>
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted">
            <Avatar size={24} name={user?.fullName} src={user?.avatar} />
            <span>Your network</span>
          </div>
        </>
      ) : null}
    </nav>
  );
}
