import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface HeaderProps {
  title: string;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean | ((val: boolean) => boolean)) => void;
}

const Header: React.FC<HeaderProps> = ({ title, isDarkMode, setIsDarkMode }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-surface/80 dark:bg-darkSurface/80 backdrop-blur-lg">
      <div className="max-w-md mx-auto px-5 h-24 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-textPrimary dark:text-darkTextPrimary tracking-tight">{title}</h1>
        <button
          onClick={() => setIsDarkMode(prev => !prev)}
          className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-textSecondary dark:text-darkTextSecondary hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
      </div>
    </header>
  );
};

export default Header;