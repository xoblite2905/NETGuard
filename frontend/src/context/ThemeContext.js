// src/context/ThemeContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';

const colorPalettes = {
  // ===================================================================
  // LIGHT MODE THEME - FINAL & COMPLETE
  // ===================================================================
  light: {
    textColor: '#475569',
    gridColor: '#E5E7EB',
    alerts: '#5C6CEC',
    protocolDistribution: ['#5C6CEC', '#4338CA', '#A5B4FC', '#EC4899', '#22D3EE', '#C084FC'],
    liveThroughput: ['#5C6CEC', '#4338CA'],
    highlight: '#4338CA',
    
    // THE FIX IS HERE: "good" status now uses the primary theme color.
    status: {
      good: '#5C6CEC',   // Was green, is now the primary light-mode blue for a cohesive look.
      medium: '#F59E0B', // Remains a strong choice for medium status.
      bad: '#EF4444'     // Remains a strong choice for bad status.
    },
  },
  // ===================================================================
  // DARK MODE THEME - FINAL & COMPLETE
  // ===================================================================
  dark: {
    textColor: '#A998BC',
    gridColor: 'rgba(174, 160, 248, 0.15)',
    alerts: '#EE7200',
    protocolDistribution: ['#EE7200', '#FE9000', '#FACC15', '#4F46E5', '#7C3AED', '#38BDF8', '#FE5000'],
    liveThroughput: ['#EE7200', '#FE5000'],
    highlight: '#EE7200',

    // THE FIX IS HERE: "good" status now uses the primary theme color.
    status: {
      good: '#EE7200',   // Was green, is now the primary dark-mode orange.
      medium: '#FACC15', // Uses the thematic yellow to avoid clashing with the new 'good' color.
      bad: '#F43F5E'
    },
  }
};

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const isDarkMode = theme === 'dark';
  const chartColors = theme === 'dark' ? colorPalettes.dark : colorPalettes.light;
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode, chartColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
export default ThemeContext;