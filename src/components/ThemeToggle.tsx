import { useState } from 'react';

const THEME_KEY = 'eventnest.kawaii.scrapbook.theme';

function getIcon(isDark: boolean) {
  if (isDark) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function getInitialTheme(): boolean {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function ThemeToggle({ variant = 'rail' }: { variant?: 'rail' | 'icon' }) {
  const [isDark, setIsDark] = useState(getInitialTheme);

  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    setIsDark(!isDark);
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        className="icon-btn"
        onClick={toggle}
        aria-pressed={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to night stalls'}
      >
        {getIcon(isDark)}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="rail-theme"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to night stalls'}
    >
      {getIcon(isDark)}
      <span className="rail-theme__label">
        {isDark ? 'Day stalls' : 'Night stalls'}
      </span>
    </button>
  );
}