
import React from 'react';
import { View } from '../types';
import { CalendarIcon, UsersIcon, ClockIcon, CogIcon } from './icons';

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
      className="relative group flex flex-col items-center justify-center flex-1 h-full focus:outline-none pt-2 pb-safe"
      aria-label={label}
    >
        <div className={`relative z-10 p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/20' : ''}`}>
           {React.cloneElement(icon, { 
               className: `h-6 w-6 transition-all duration-300 ${isActive ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-textSecondary opacity-60'}` 
           })}
        </div>
        <span className={`text-[10px] font-medium mt-1 transition-all duration-300 ${isActive ? 'text-primary opacity-100' : 'text-textSecondary opacity-60'}`}>
            {label}
        </span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 w-full">
        {/* Gradient border top */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        <nav className="bg-[#0F172A]/90 backdrop-blur-xl w-full h-[80px] flex justify-around items-start px-2 pb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            <NavItem
                icon={<CalendarIcon />}
                label="Calendario"
                isActive={currentView === View.CALENDAR}
                onClick={() => setView(View.CALENDAR)}
            />
            <NavItem
                icon={<UsersIcon />}
                label="Reuniones"
                isActive={currentView === View.MEETINGS}
                onClick={() => setView(View.MEETINGS)}
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
        </nav>
    </div>
  );
};

export default BottomNav;
