import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available themes
export type ThemeType = 'light' | 'dark' | 'spooky';

// Theme context type
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from localStorage or default to light
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('saga-theme') as ThemeType;
      return savedTheme || 'light';
    }
    return 'light';
  });

  // Toggle between themes
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : prevTheme === 'dark' ? 'spooky' : 'light';
      return newTheme;
    });
  };

  // Apply theme to document and save to localStorage when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    // Remove previous theme classes
    root.classList.remove('light-theme', 'dark-theme', 'spooky-theme');
    body.classList.remove('dark', 'spooky');
    
    // For dark and spooky themes, add class to body for global styling
    if (theme === 'dark') {
      body.classList.add('dark');
    } else if (theme === 'spooky') {
      body.classList.add('spooky');
    }
    
    // Add current theme class to root for CSS variables
    if (theme !== 'light') {
      root.classList.add(`${theme}-theme`);
    }
    
    // Save to localStorage
    localStorage.setItem('saga-theme', theme);
  }, [theme]);

  // Provide theme context to children
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}