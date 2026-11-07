import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function firstVisitTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'dark',
      reduceMotion: false,
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: 'videohub-theme' },
  ),
);

export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0F0F0F' : '#FFFFFF');
}

export { firstVisitTheme };
