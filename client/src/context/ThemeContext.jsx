import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'editorial',
  setTheme: () => {},
  cycleTheme: () => {}
});

export const THEMES = [
  { id: 'editorial', label: 'Editorial Ivory', icon: '🏛️', subtitle: 'Warm Prestigious Atelier' },
  { id: 'nordic', label: 'Nordic Slate', icon: '🌌', subtitle: 'Minimalist Clean Dark' },
  { id: 'midnight', label: 'Midnight Gold', icon: '🌿', subtitle: 'Royal Obsidian Guild' }
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('bookleaf_theme') || 'editorial';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = `theme-${theme}`;
    localStorage.setItem('bookleaf_theme', theme);
  }, [theme]);

  function cycleTheme() {
    setTheme(prev => {
      const idx = THEMES.findIndex(t => t.id === prev);
      const nextIdx = (idx + 1) % THEMES.length;
      return THEMES[nextIdx].id;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
