import { useEffect } from 'react';
import { applyTheme, useThemeStore } from '@/store/themeStore';

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const reduceMotion = useThemeStore((s) => s.reduceMotion);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setReduceMotion = useThemeStore((s) => s.setReduceMotion);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return { theme, reduceMotion, toggleTheme, setTheme, setReduceMotion };
}
