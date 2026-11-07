import { Outlet } from 'react-router-dom';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg text-text grid place-items-center px-4">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[400px] rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow)]">
        <Outlet />
      </div>
    </div>
  );
}
