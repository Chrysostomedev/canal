'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Theme, ThemeColor, ThemeMode } from '../lib/theme-config';

interface ThemeContextType {
  theme: Theme;
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
  applyTheme: (color: ThemeColor, mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>({
    color: 'slate',
    mode: 'light',
  });

  const [mounted, setMounted] = useState(false);

  // Charger le thème depuis localStorage au mount
  useEffect(() => {
    setMounted(true);
    
    // Vérifier si on est côté client
    if (typeof window === 'undefined') return;
    
    const savedColor = (localStorage.getItem('theme-color') as ThemeColor) || 'slate';
    const savedMode = (localStorage.getItem('theme-mode') as ThemeMode) || 'light';
    
    setTheme({ color: savedColor, mode: savedMode });
    applyTheme(savedColor, savedMode);
  }, []);

  // Fonction d'application du thème
  const applyTheme = (color: ThemeColor, mode: ThemeMode) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Appliquer la couleur
    root.setAttribute('data-theme-color', color);
    
    // Appliquer le mode (avec support system)
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme-mode', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme-mode', mode);
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('theme-color', color);
    localStorage.setItem('theme-mode', mode);
  };

  const setThemeColor = (color: ThemeColor) => {
    const newTheme = { ...theme, color };
    setTheme(newTheme);
    applyTheme(color, theme.mode);
  };

  const setThemeMode = (mode: ThemeMode) => {
    const newTheme = { ...theme, mode };
    setTheme(newTheme);
    applyTheme(theme.color, mode);
  };

  // Éviter le flash de thème incorrect (optionnel)
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setThemeColor, setThemeMode, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
