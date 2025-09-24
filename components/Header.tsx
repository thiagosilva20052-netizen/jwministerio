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
    <header className="fixed top-0 left-0 right-0 z-20 bg-surface/80 dark:bg-darkSurface/80 backdrop-blur-lg">
      <div className="max-w-md mx-auto px-5 h-24 flex items-center justify-between">
        <div className="flex-grow min-w-0 pr-4">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              className="text-3xl font-bold bg-transparent border-b-2 border-primary focus:outline-none text-textPrimary dark:text-darkTextPrimary tracking-tight w-full"
            />
          ) : (
            <div 
              className="group flex items-center gap-2 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <h1 className="text-3xl font-bold text-textPrimary dark:text-darkTextPrimary tracking-tight truncate">{appTitle}</h1>
              <PencilIcon className="h-5 w-5 text-textSecondary dark:text-darkTextSecondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          )}
          <p className="text-md text-textSecondary dark:text-darkTextSecondary truncate">{viewTitle}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onToggleAssistant}
            className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-textSecondary dark:text-darkTextSecondary hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="Abrir asistente de IA"
          >
            <SparklesIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2.5 rounded-full bg-black/5 dark:bg-white/10 text-textSecondary dark:text-darkTextSecondary hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;