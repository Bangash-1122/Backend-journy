import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      sidebarOpen: false,
      sidebarCollapsed: false,
      searchOpen: false,
      activeModal: null,
      modalPayload: null,
      demoMode: false,
      offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen, sidebarCollapsed: s.sidebarOpen ? s.sidebarCollapsed : false })),
      toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      openModal: (activeModal, modalPayload = null) => set({ activeModal, modalPayload }),
      closeModal: () => set({ activeModal: null, modalPayload: null }),
      setDemoMode: (demoMode) => set({ demoMode }),
      setOffline: (offline) => set({ offline }),
    }),
    {
      name: 'videohub-ui',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
