import React from 'react';
import { View } from '../types';
import { CalendarIcon, BookOpenIcon, UsersIcon, ClockIcon } from './icons';

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
  const activeIconClasses = 'text-white';
  const inactiveIconClasses = 'text-textSecondary dark:text-darkTextSecondary group-hover:text-textPrimary dark:group-hover:text-darkTextPrimary';
  
  const activeLabelClasses = 'text-primary dark:text-primary-light';
  const inactiveLabelClasses = 'text-textSecondary dark:text-darkTextSecondary group-hover:text-textPrimary dark:group-hover:text-darkTextPrimary';


  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center justify-center w-full pt-3 pb-2 focus:outline-none transition-colors duration-200"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
        <div className={`flex items-center justify-center h-10 w-16 rounded-2xl transition-all duration-300 ease-in-out ${isActive ? 'bg-primary' : ''}`}>
          {React.cloneElement(icon, { className: `h-7 w-7 transition-colors duration-200 ${isActive ? activeIconClasses : inactiveIconClasses}` })}
        </div>
      <span className={`text-xs mt-1.5 font-semibold transition-colors duration-200 ${isActive ? activeLabelClasses : inactiveLabelClasses}`}>{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-surface/80 dark:bg-darkSurface/80 backdrop-blur-lg border-t border-separator dark:border-darkSeparator">
      <div className="max-w-md mx-auto flex justify-around h-[88px]">
        <NavItem
          icon={<CalendarIcon />}
          label="Ministerio"
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
          label="Operatividad"
          isActive={currentView === View.DUTIES}
          onClick={() => setView(View.DUTIES)}
        />
        <NavItem
          icon={<ClockIcon />}
          label="Servicio"
          isActive={currentView === View.SERVICE_LOG}
          onClick={() => setView(View.SERVICE_LOG)}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
