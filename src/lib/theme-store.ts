import { create } from 'zustand';
import type { ColorMode } from './tag-style';

const THEME_KEY = 'eventnest.kawaii.scrapbook.theme';
let switchTimer: number | undefined;

function initialTheme(): ColorMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

interface ThemeState {
  theme: ColorMode;
  setTheme: (theme: ColorMode) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme(),

  setTheme: (theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-switching');
      window.clearTimeout(switchTimer);
      switchTimer = window.setTimeout(() => root.classList.remove('theme-switching'), 340);
    }
    set({ theme });
  },

  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}));

export function useColorMode(): ColorMode {
  return useThemeStore((s) => s.theme);
}
