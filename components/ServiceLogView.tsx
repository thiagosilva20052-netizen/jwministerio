import React, { useState, useEffect, useMemo } from 'react';
import { ServiceEntry } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from './icons';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: ServiceEntry) => void;
  onDelete: (id: string) => void;
  initialData?: ServiceEntry | null;
  selectedDate: string;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, selectedDate }) => {
  const [hours, setHours] = useState<number | ''>('');
  const [placements, setPlacements] = useState<number | ''>('');
  const [videos, setVideos] = useState<number | ''>('');
  const [returnVisits, setReturnVisits] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setHours(initialData.hours);
        setPlacements(initialData.placements || '');
        setVideos(initialData.videos || '');
        setReturnVisits(initialData.returnVisits || '');
      } else {
        setHours('');
        setPlacements('');
        setVideos('');
        setReturnVisits('');
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hours !== '' && hours >= 0) {
      onSubmit({
        id: selectedDate,
        date: selectedDate,
        hours: Number(hours),
        placements: placements !== '' ? Number(placements) : undefined,
        videos: videos !== '' ? Number(videos) : undefined,
        returnVisits: returnVisits !== '' ? Number(returnVisits) : undefined,
      });
      onClose();
    }
  };

  const handleDelete = () => {
    if (initialData && window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
      onDelete(initialData.id);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <div className={`bg-surface dark:bg-darkSurface p-5 pb-8 rounded-t-3xl shadow-xl w-full max-w-md transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5"></div>
        <h2 className="text-2xl font-bold mb-5 text-textPrimary dark:text-darkTextPrimary">{initialData ? 'Editar Registro' : 'Añadir Registro'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="date">Fecha</label>
            <input type="date" id="date" value={selectedDate} readOnly className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-background dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="hours">Horas</label>
              <input id="hours" type="number" step="0.1" min="0" value={hours} onChange={e => setHours(e.target.value === '' ? '' : parseFloat(e.target.value))} required className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="placements">Colocaciones</label>
              <input id="placements" type="number" min="0" value={placements} onChange={e => setPlacements(e.target.value === '' ? '' : parseInt(e.target.value))} className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="videos">Videos</label>
              <input id="videos" type="number" min="0" value={videos} onChange={e => setVideos(e.target.value === '' ? '' : parseInt(e.target.value))} className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="returnVisits">Revisitas</label>
              <input id="returnVisits" type="number" min="0" value={returnVisits} onChange={e => setReturnVisits(e.target.value === '' ? '' : parseInt(e.target.value))} className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-4">
             {initialData && (
                <button type="button" onClick={handleDelete} className="bg-red-500/15 text-red-500 font-bold py-3 px-5 rounded-full hover:bg-red-500/25 transition-colors flex items-center gap-2"><TrashIcon className="h-5 w-5" /> Eliminar</button>
             )}
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className="bg-gray-500/15 text-textSecondary dark:text-darkTextSecondary font-bold py-3 px-5 rounded-full hover:bg-gray-500/25 transition-colors">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-full focus:outline-none focus:shadow-outline transition-transform active:scale-95">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


interface ServiceLogViewProps {
  entries: ServiceEntry[];
  onAddOrUpdateEntry: (entry: ServiceEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const ServiceLogView: React.FC<ServiceLogViewProps> = ({ entries, onAddOrUpdateEntry, onDeleteEntry }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingEntry, setEditingEntry] = useState<ServiceEntry | null>(null);

  const MONTHLY_GOAL = 50;

  const { totalHoursThisMonth, progressPercentage, remainingHours } = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const entriesThisMonth = entries.filter(entry => {
        const entryDate = new Date(entry.date + 'T00:00:00');
        return entryDate >= startOfMonth && entryDate <= endOfMonth;
    });

    const totalHours = entriesThisMonth.reduce((sum, entry) => sum + entry.hours, 0);
    const progress = Math.min((totalHours / MONTHLY_GOAL) * 100, 100);
    const remaining = Math.max(MONTHLY_GOAL - totalHours, 0);

    return { totalHoursThisMonth: totalHours, progressPercentage: progress, remainingHours: remaining };
  }, [entries, currentDate]);

  const weeklyTotals = useMemo(() => {
    const today = new Date();
    const isCurrentMonthView = today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth();
    
    const referenceDate = isCurrentMonthView ? today : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const dayOfWeek = (referenceDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6
    
    const startOfWeek = new Date(referenceDate);
    startOfWeek.setDate(referenceDate.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const entriesThisWeek = entries.filter(entry => {
        const entryDate = new Date(entry.date + 'T00:00:00');
        return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    return entriesThisWeek.reduce((acc, entry) => {
        acc.hours += entry.hours || 0;
        acc.placements += entry.placements || 0;
        acc.videos += entry.videos || 0;
        acc.returnVisits += entry.returnVisits || 0;
        return acc;
    }, { hours: 0, placements: 0, videos: 0, returnVisits: 0 });
  }, [entries, currentDate]);


  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = (startOfMonth.getDay() + 6) % 7; // Lunes = 0

  const days = Array.from({ length: startDayOfWeek }, (_, i) => <div key={`empty-${i}`} className=""></div>);

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dateString = dayDate.toISOString().split('T')[0];
    const entryForDay = entries.find(e => e.date === dateString);
    const isToday = dateString === new Date().toISOString().split('T')[0];
    const hasEntry = entryForDay && entryForDay.hours > 0;

    days.push(
      <div 
        key={i} 
        className={`py-2 flex flex-col items-center justify-start min-h-[70px] cursor-pointer rounded-2xl transition-colors duration-200 ${hasEntry ? 'bg-primary/10 dark:bg-primary/20' : 'hover:bg-black/5 dark:hover:bg-white/5'}`} 
        onClick={() => handleDateClick(dateString)}
      >
        <time 
          dateTime={dateString} 
          className={`text-base w-8 h-8 flex items-center justify-center rounded-full relative ${isToday ? 'text-primary font-bold' : 'text-textPrimary dark:text-darkTextPrimary'} ${hasEntry ? 'font-bold' : 'font-medium'}`}
        >
          {isToday && <span className="absolute inset-0 rounded-full ring-2 ring-primary/70"></span>}
          {i}
        </time>
        {hasEntry && (
            <div className="mt-1 text-sm font-bold text-primary dark:text-primary-light">
                {entryForDay.hours % 1 === 0 ? `${entryForDay.hours}h` : `${entryForDay.hours.toFixed(1)}h`}
            </div>
        )}
      </div>
    );
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setEditingEntry(entries.find(e => e.date === date) || null);
    setIsModalOpen(true);
  };
  
  const handleAddClick = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setEditingEntry(entries.find(e => e.date === today) || null);
    setIsModalOpen(true);
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };
  
  const handleSubmit = (entryData: ServiceEntry) => {
    if (!entryData.hours && !entryData.placements && !entryData.videos && !entryData.returnVisits) {
        onDeleteEntry(entryData.id);
    } else {
        onAddOrUpdateEntry(entryData);
    }
  };

  const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  return (
    <div className="p-4 animate-[fade-in_0.5s_ease-in-out]">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
        </h2>
        <div className="flex items-center space-x-1">
          <button onClick={() => changeMonth(-1)} className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary transition-colors"><ChevronLeftIcon className="h-6 w-6" /></button>
          <button onClick={() => changeMonth(1)} className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary transition-colors"><ChevronRightIcon className="h-6 w-6" /></button>
        </div>
      </div>
      
      <div className="bg-surface dark:bg-darkSurface shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl p-4 mb-6">
        <h3 className="font-bold text-lg text-textPrimary dark:text-darkTextPrimary mb-3">Progreso Mensual</h3>
        <div className="w-full bg-gray-200 dark:bg-darkSurface rounded-full h-2.5 mb-2">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="flex justify-between text-sm font-medium text-textSecondary dark:text-darkTextSecondary">
            <span>{totalHoursThisMonth.toFixed(1)}h de {MONTHLY_GOAL}h</span>
            <span>Faltan {remainingHours.toFixed(1)}h</span>
        </div>
      </div>
      
      <div className="bg-surface dark:bg-darkSurface shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl p-4 mb-6">
        <h3 className="font-bold text-lg text-textPrimary dark:text-darkTextPrimary mb-3">Resumen Semanal</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
                <p className="text-2xl font-bold text-primary dark:text-primary-light">{weeklyTotals.hours.toFixed(1)}</p>
                <p className="text-xs font-medium text-textSecondary dark:text-darkTextSecondary uppercase tracking-wider">Horas</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-primary dark:text-primary-light">{weeklyTotals.placements}</p>
                <p className="text-xs font-medium text-textSecondary dark:text-darkTextSecondary uppercase tracking-wider">Colocaciones</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-primary dark:text-primary-light">{weeklyTotals.videos}</p>
                <p className="text-xs font-medium text-textSecondary dark:text-darkTextSecondary uppercase tracking-wider">Videos</p>
            </div>
            <div>
                <p className="text-2xl font-bold text-primary dark:text-primary-light">{weeklyTotals.returnVisits}</p>
                <p className="text-xs font-medium text-textSecondary dark:text-darkTextSecondary uppercase tracking-wider">Revisitas</p>
            </div>
        </div>
      </div>

      <div className="bg-surface dark:bg-darkSurface shadow-xl shadow-slate-200/50 dark:shadow-black/20 rounded-2xl p-4">
        <div className="grid grid-cols-7">
            {weekdays.map(day => (
              <div key={day} className="text-center font-semibold text-sm py-2 text-textSecondary dark:text-darkTextSecondary">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
            {days}
        </div>
      </div>
      
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={onDeleteEntry}
        initialData={editingEntry}
        selectedDate={selectedDate}
      />
      
      <button onClick={handleAddClick} className="fixed bottom-28 right-5 bg-primary hover:bg-primary-dark text-white rounded-2xl p-4 shadow-lg shadow-primary/40 z-20 transform transition-transform hover:scale-105 active:scale-95">
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default ServiceLogView;