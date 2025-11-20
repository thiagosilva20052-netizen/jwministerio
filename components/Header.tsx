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
    <header className="absolute top-0 left-0 right-0 z-20 bg-transparent pt-[env(safe-area-inset-top)]">
      <div className="px-6 h-24 flex items-center justify-between">
        <div className="flex-grow min-w-0 pr-4 pt-4">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyDown}
              className="text-2xl font-bold bg-transparent border-b-2 border-primary focus:outline-none text-white tracking-tight w-full"
            />
          ) : (
            <div 
              className="group flex items-center gap-2 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <h1 className="text-2xl font-bold text-white tracking-tight truncate drop-shadow-sm">{appTitle}</h1>
              <PencilIcon className="h-4 w-4 text-textSecondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          )}
          <p className="text-sm text-textSecondary font-medium opacity-80 mt-0.5 tracking-wide">{viewTitle}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 pt-4">
          <button
            onClick={onToggleAssistant}
            className="p-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 active:scale-95 border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            aria-label="Abrir asistente de IA"
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
          {/* Hidden for now as we enforce Pro Dark Theme, but kept for logic */}
          {/* <button
            onClick={() => setIsDarkMode(prev => !prev)}
            className="p-2.5 rounded-full bg-white/5 text-textSecondary hover:bg-white/10 transition-all duration-200 active:scale-95 shadow-sm border border-white/5"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;