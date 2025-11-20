
import React from 'react';
import { View } from '../types';
import { CalendarIcon, BookOpenIcon, UsersIcon, ClockIcon, CogIcon } from './icons';

interface BottomNavProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  
  return (
    <button
      onClick={onClick}
      className="relative group flex flex-col items-center justify-center w-full focus:outline-none"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
        {/* Indicator background */}
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl transition-all duration-300 ease-out ${isActive ? 'bg-primary/10 dark:bg-primary/20 scale-100' : 'scale-0'}`}></div>
        
        <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-active:scale-95'}`}>
           {React.cloneElement(icon, { 
               className: `h-6 w-6 transition-colors duration-300 ${isActive ? 'text-primary dark:text-primary-light' : 'text-textSecondary dark:text-darkTextSecondary'}` 
           })}
        </div>
        
      <span className={`text-[10px] mt-1 font-semibold transition-all duration-300 ${isActive ? 'text-primary dark:text-primary-light translate-y-0 opacity-100' : 'text-textSecondary dark:text-darkTextSecondary translate-y-1 opacity-0 lg:opacity-100 lg:translate-y-0'}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 sm:absolute bg-[#F2F2F7]/85 dark:bg-black/85 backdrop-blur-xl border-t border-black/5 dark:border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-[88px] px-2">
        <NavItem
          icon={<CalendarIcon />}
          label="Calendario"
          isActive={currentView === View.CALENDAR}
          onClick={() => setView(View.CALENDAR)}
        />
        <NavItem
          icon={<BookOpenIcon />}
          label="Escuela"
          isActive={currentView === View.SCHOOL}
          onClick={() => setView(View.SCHOOL)}
        />
        <NavItem
          icon={<UsersIcon />}
          label="Deberes"
          isActive={currentView === View.DUTIES}
          onClick={() => setView(View.DUTIES)}
        />
        <NavItem
          icon={<ClockIcon />}
          label="Registro"
          isActive={currentView === View.SERVICE_LOG}
          onClick={() => setView(View.SERVICE_LOG)}
        />
        <NavItem
          icon={<CogIcon />}
          label="Ajustes"
          isActive={currentView === View.SETTINGS}
          onClick={() => setView(View.SETTINGS)}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
