import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import AddToPlaylistModal from '@/components/playlist/AddToPlaylistModal';
import { useUiStore } from '@/store/uiStore';

export default function MainLayout() {
  const location = useLocation();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const offline = useUiStore((s) => s.offline);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      {offline ? (
        <div className="bg-warning/20 px-4 py-2 text-center text-sm text-warning">You are offline — some actions are unavailable</div>
      ) : null}
      <div className="flex">
        <aside className={`hidden sm:block sticky top-14 h-[calc(100vh-56px)] border-r border-border bg-bg ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}>
          <Sidebar />
        </aside>
        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 sm:hidden">
            <button className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.26 }}
              className="relative h-full w-[260px] bg-bg pt-2"
            >
              <Sidebar variant="drawer" />
            </motion.aside>
          </div>
        ) : null}
        <main className="min-w-0 flex-1 px-4 py-4 pb-20 md:px-6 md:py-6 md:pb-8 max-w-[1600px]">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
      <MobileBottomNav />
      <AddToPlaylistModal />
    </div>
  );
}
