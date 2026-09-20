import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { safeStorage } from '../utils/storage';

export type Theme = 'cyber-lime' | 'midnight' | 'high-contrast' | 'cyan';

const VALID_THEMES: readonly Theme[] = ['cyber-lime', 'midnight', 'high-contrast', 'cyan'] as const;

function isValidTheme(t: unknown): t is Theme {
  return typeof t === 'string' && (VALID_THEMES as readonly string[]).includes(t as Theme);
}

interface ThemeContextType {
  theme: Theme;
  cycleTheme: () => void;
  setSpecificTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = safeStorage.getItem('shadow-theme', 'cyber-lime');
    // If it was previous default 'graphite' or not valid, migrate to user's desired 'cyber-lime'
    if (saved === 'graphite' || !isValidTheme(saved)) {
      return 'cyber-lime';
    }
    return saved;
  });

  useEffect(() => {
    safeStorage.setItem('shadow-theme', theme);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'cyber-lime') return 'midnight';
      if (prev === 'midnight') return 'high-contrast';
      if (prev === 'high-contrast') return 'cyan';
      return 'cyber-lime';
    });
  }, []);

  const setSpecificTheme = useCallback((t: Theme) => {
    if (isValidTheme(t)) {
      setTheme(t);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, cycleTheme, setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
