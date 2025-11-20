
import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, PencilIcon, SparklesIcon } from './icons';

interface HeaderProps {
  appTitle: string;
  setAppTitle: (value: string | ((val: string) => string)) => void;
  viewTitle: string;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean | ((val: boolean) => boolean)) => void;
  onToggleAssistant: () => void;
}

const Header: React.FC<HeaderProps> = ({ appTitle, setAppTitle, viewTitle, isDarkMode, setIsDarkMode, onToggleAssistant }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(appTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setDraftTitle(appTitle);
  }, [appTitle]);

  const handleTitleSave = () => {
    if (draftTitle.trim() === '') {
      setDraftTitle(appTitle); 
    } else {
      setAppTitle(draftTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setDraftTitle(appTitle);
      setIsEditing(false);
    }
  };
  
  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-[#F2F2F7]/85 dark:bg-black/85 backdrop-blur-xl border-b border-black/5 dark:border-white/5 transition-colors duration-300 pt-[env(safe-area-inset-top)]">
      <div className="px-6 h-24 flex items-center justify-between">
        <div className="flex-grow min-w-0 pr-4 pt-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              className="text-2xl font-bold bg-transparent border-b-2 border-primary focus:outline-none text-textPrimary dark:text-darkTextPrimary tracking-tight w-full"
            />
          ) : (
            <div 
              className="group flex items-center gap-2 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <h1 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary tracking-tight truncate">{appTitle}</h1>
              <PencilIcon className="h-4 w-4 text-textSecondary dark:text-darkTextSecondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          )}
          <p className="text-sm text-textSecondary dark:text-darkTextSecondary truncate font-medium opacity-80 mt-0.5">{viewTitle}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 pt-2">
          <button
            onClick={onToggleAssistant}
            className="p-2.5 rounded-full bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-200 active:scale-95 border border-indigo-500/20 shadow-sm"
            aria-label="Abrir asistente de IA"
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2.5 rounded-full bg-white dark:bg-white/10 text-textSecondary dark:text-darkTextSecondary hover:bg-gray-100 dark:hover:bg-white/20 transition-all duration-200 active:scale-95 shadow-sm"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
