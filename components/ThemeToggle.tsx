import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-[100] p-3 rounded-full shadow-xl transition-all duration-500 ${
        isDark 
          ? 'bg-white text-black hover:bg-neural-cyan hover:shadow-neon-cyan' 
          : 'bg-black text-white hover:bg-gray-800'
      }`}
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};