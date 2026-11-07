import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Mic, Plus, Search } from 'lucide-react';
import SearchInput from '@/components/ui/SearchInput';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { RECENT_SEARCHES_KEY } from '@/lib/constants';
import { readJson, writeJson } from '@/lib/storage';
import { toast } from 'sonner';

export default function Header() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const demoMode = useUiStore((s) => s.demoMode);
  const searchOpen = useUiStore((s) => s.searchOpen);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleCollapsed = useUiStore((s) => s.toggleCollapsed);
  const [menu, setMenu] = useState(false);

  const submit = (value) => {
    const term = (value || q).trim();
    if (!term) return;
    const recent = readJson(RECENT_SEARCHES_KEY, []).filter((x) => x !== term);
    writeJson(RECENT_SEARCHES_KEY, [term, ...recent].slice(0, 8));
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-surface px-3 md:px-4">
      <button
        className="size-11 grid place-items-center rounded-full hover:bg-elevated"
        aria-label="Toggle sidebar"
        onClick={() => {
          if (window.innerWidth < 640) toggleSidebar();
          else toggleCollapsed();
        }}
      >
        <Menu size={22} />
      </button>
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <span className="grid size-8 place-items-center rounded-lg bg-brand text-white">
          <svg viewBox="0 0 24 24" className="size-4 fill-current">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="text-lg font-bold hidden sm:block">VideoHub</span>
      </Link>
      {demoMode ? (
        <span className="hidden md:inline rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">Demo mode</span>
      ) : null}

      <div className="mx-auto hidden md:flex flex-1 justify-center items-center gap-2">
        <SearchInput value={q} onChange={setQ} onSubmit={submit} />
        <button className="size-10 grid place-items-center rounded-full bg-surface border border-border" aria-label="Voice search (coming soon)" type="button">
          <Mic size={18} />
        </button>
      </div>

      <div className="ml-auto flex items-center">
        <button className="md:hidden size-11 grid place-items-center rounded-full hover:bg-elevated" aria-label="Search" onClick={() => setSearchOpen(!searchOpen)}>
          <Search size={20} />
        </button>
        <Link to="/upload" className="size-11 grid place-items-center rounded-full hover:bg-elevated" aria-label="Upload">
          <Plus size={22} />
        </Link>
        <ThemeToggle />
        <button className="size-11 grid place-items-center rounded-full hover:bg-elevated" aria-label="Notifications" onClick={() => toast.info('Notifications coming soon')}>
          <Bell size={20} />
        </button>
        {isAuthenticated ? (
          <div className="relative">
            <button className="p-1" onClick={() => setMenu((v) => !v)} aria-label="Account menu">
              <Avatar src={user?.avatar} name={user?.fullName} size={32} />
            </button>
            {menu ? (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-elevated p-2 shadow-[var(--shadow)]">
                <Link to={user?.username ? `/channel/${user.username}` : '/profile'} className="block rounded-md px-3 py-2 text-sm hover:bg-surface" onClick={() => setMenu(false)}>
                  Channel
                </Link>
                <Link to="/studio" className="block rounded-md px-3 py-2 text-sm hover:bg-surface" onClick={() => setMenu(false)}>
                  Studio
                </Link>
                <Link to="/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-surface" onClick={() => setMenu(false)}>
                  Settings
                </Link>
                <button
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface"
                  onClick={() => {
                    logout();
                    setMenu(false);
                    toast.success('Signed out');
                    navigate('/');
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link to="/login" className="ml-1 rounded-full border border-info px-3 py-1.5 text-sm font-semibold text-info">
            Sign in
          </Link>
        )}
      </div>

      {searchOpen ? (
        <div className="absolute inset-x-0 top-14 border-b border-border bg-surface p-3 md:hidden">
          <SearchInput value={q} onChange={setQ} onSubmit={submit} />
        </div>
      ) : null}
    </header>
  );
}
