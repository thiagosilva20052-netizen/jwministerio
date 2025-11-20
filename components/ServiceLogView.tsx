import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ServiceEntry } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, PlayIcon, PauseIcon, StopIcon } from './icons';

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

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
      setValidationError('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (hours === '') {
        setValidationError('El campo de horas es obligatorio.');
        return;
    }

    if (hours < 0) {
        setValidationError('Las horas no pueden ser negativas.');
        return;
    }

    onSubmit({
        id: selectedDate,
        date: selectedDate,
        hours: Number(hours),
        placements: placements !== '' ? Number(placements) : undefined,
        videos: videos !== '' ? Number(videos) : undefined,
        returnVisits: returnVisits !== '' ? Number(returnVisits) : undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    setIsConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (initialData) {
      onDelete(initialData.id);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={!isConfirmOpen ? onClose : undefined}>
      <div className={`bg-[#1E293B] border-t border-white/10 p-6 pb-10 rounded-t-[2rem] shadow-2xl w-full max-w-[480px] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"></div>
        <h2 className="text-2xl font-bold mb-6 text-white px-1 tracking-tight">{initialData ? 'Editar Registro' : 'Añadir Registro'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="date">Fecha</label>
            <input type="date" id="date" value={selectedDate} readOnly className="appearance-none border-none bg-white/5 rounded-2xl w-full py-4 px-5 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="hours">Horas</label>
              <input 
                id="hours" 
                type="number" 
                step="0.1" 
                min="0" 
                value={hours} 
                onChange={e => setHours(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                className={`appearance-none border-none rounded-2xl w-full py-4 px-5 text-white bg-black/20 leading-tight focus:outline-none focus:ring-2 transition-all shadow-inner text-lg font-bold ${validationError ? 'ring-2 ring-red-500 bg-red-900/20' : 'focus:ring-primary'}`}
              />
            </div>
            <div>
              <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="placements">Colocaciones</label>
              <input id="placements" type="number" min="0" value={placements} onChange={e => setPlacements(e.target.value === '' ? '' : parseInt(e.target.value))} className="appearance-none border-none bg-black/20 rounded-2xl w-full py-4 px-5 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-lg" />
            </div>
            <div>
              <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="videos">Videos</label>
              <input id="videos" type="number" min="0" value={videos} onChange={e => setVideos(e.target.value === '' ? '' : parseInt(e.target.value))} className="appearance-none border-none bg-black/20 rounded-2xl w-full py-4 px-5 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-lg" />
            </div>
            <div>
              <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="returnVisits">Revisitas</label>
              <input id="returnVisits" type="number" min="0" value={returnVisits} onChange={e => setReturnVisits(e.target.value === '' ? '' : parseInt(e.target.value))} className="appearance-none border-none bg-black/20 rounded-2xl w-full py-4 px-5 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-inner text-lg" />
            </div>
          </div>
          
          {validationError && (
             <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <p className="text-sm text-red-400 font-medium text-center">{validationError}</p>
             </div>
          )}

          <div className="flex items-center gap-3 pt-6">
             {initialData && (
                <button type="button" onClick={handleDelete} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold p-4 rounded-2xl transition-all active:scale-95 flex-shrink-0 border border-red-500/20" aria-label="Eliminar">
                   <TrashIcon className="h-6 w-6" />
                </button>
             )}
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 border border-white/5">Cancelar</button>
            <button type="submit" className="bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30 transform transition-all active:scale-95">Guardar</button>
          </div>
        </form>
      </div>
      
      {isConfirmOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[60]" onClick={() => setIsConfirmOpen(false)}>
            <div className="bg-[#1E293B] p-8 rounded-3xl shadow-2xl w-full max-w-xs m-4 border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 shadow-glow">
                   <TrashIcon className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-center mb-2 text-white">¿Eliminar registro?</h2>
                <p className="text-center text-textSecondary mb-8 leading-relaxed text-sm">Se borrará de tus estadísticas.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={handleConfirmDelete} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-5 rounded-2xl shadow-lg shadow-red-500/30 active:scale-95">Sí, eliminar</button>
                    <button onClick={() => setIsConfirmOpen(false)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-5 rounded-2xl active:scale-95">Cancelar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const Stopwatch: React.FC<{ onSave: (hours: number) => void }> = ({ onSave }) => {
  const [state, setState] = useState<'IDLE' | 'RUNNING' | 'PAUSED'>('IDLE');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const savedState = localStorage.getItem('stopwatchState');
    const savedStartTime = localStorage.getItem('stopwatchStartTime');
    const savedAccumulated = localStorage.getItem('stopwatchAccumulated');

    if (savedState) {
      setState(savedState as any);
      setAccumulatedTime(savedAccumulated ? parseInt(savedAccumulated) : 0);
      
      if (savedState === 'RUNNING' && savedStartTime) {
        setStartTime(parseInt(savedStartTime));
      } else if (savedState === 'PAUSED') {
        setElapsed(savedAccumulated ? parseInt(savedAccumulated) : 0);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stopwatchState', state);
    if (startTime) localStorage.setItem('stopwatchStartTime', startTime.toString());
    localStorage.setItem('stopwatchAccumulated', accumulatedTime.toString());
  }, [state, startTime, accumulatedTime]);

  useEffect(() => {
    if (state === 'RUNNING') {
      intervalRef.current = window.setInterval(() => {
        const now = Date.now();
        const start = startTime || now;
        setElapsed(now - start + accumulatedTime);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state, startTime, accumulatedTime]);

  const toggleTimer = () => {
    if (state === 'IDLE' || state === 'PAUSED') {
      setStartTime(Date.now());
      setState('RUNNING');
    } else {
      setAccumulatedTime(elapsed);
      setStartTime(null);
      setState('PAUSED');
    }
  };

  const stopTimer = () => {
    if (state !== 'IDLE') {
      const hours = elapsed / (1000 * 60 * 60);
      onSave(hours);
      setState('IDLE');
      setStartTime(null);
      setAccumulatedTime(0);
      setElapsed(0);
      localStorage.removeItem('stopwatchState');
      localStorage.removeItem('stopwatchStartTime');
      localStorage.removeItem('stopwatchAccumulated');
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 mb-6 flex items-center justify-between relative overflow-hidden shadow-glass group">
        {/* Subtle Glow Effect */}
        <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${state === 'RUNNING' ? 'opacity-50 animate-pulse' : ''}`}></div>
        
        <div className="flex flex-col relative z-10 pl-2">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-1.5">Cronómetro</span>
            <span className={`text-5xl font-mono font-bold tabular-nums tracking-tighter ${state === 'RUNNING' ? 'text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-200 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'text-white'}`}>
                {formatTime(elapsed)}
            </span>
        </div>
        <div className="flex items-center gap-3 relative z-10">
            {state !== 'IDLE' && (
                <button onClick={stopTimer} className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-95 border border-red-500/20">
                    <StopIcon className="h-5 w-5" />
                </button>
            )}
            <button 
                onClick={toggleTimer} 
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-90 shadow-lg transform border border-white/10 ${
                    state === 'RUNNING' 
                    ? 'bg-amber-400 text-black shadow-amber-400/40' 
                    : 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                }`}
            >
                {state === 'RUNNING' ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8 ml-1" />}
            </button>
        </div>
    </div>
  );
};


interface ServiceLogViewProps {
  entries: ServiceEntry[];
  onAddOrUpdateEntry: (entry: ServiceEntry) => void;
  onDeleteEntry: (id: string) => void;
  monthlyGoal: number;
}

const ServiceLogView: React.FC<ServiceLogViewProps> = ({ entries, onAddOrUpdateEntry, onDeleteEntry, monthlyGoal }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingEntry, setEditingEntry] = useState<ServiceEntry | null>(null);

  const { totalHoursThisMonth, progressPercentage, remainingHours } = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const entriesThisMonth = entries.filter(entry => {
        const entryDate = new Date(entry.date + 'T00:00:00');
        return entryDate >= startOfMonth && entryDate <= endOfMonth;
    });

    const totalHours = entriesThisMonth.reduce((sum, entry) => sum + entry.hours, 0);
    const progress = Math.min((totalHours / monthlyGoal) * 100, 100);
    const remaining = Math.max(monthlyGoal - totalHours, 0);

    return { totalHoursThisMonth: totalHours, progressPercentage: progress, remainingHours: remaining };
  }, [entries, currentDate, monthlyGoal]);

  const { chartData, maxHours } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const data = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const entry = entries.find(e => e.date === dateString);
        return {
            day: day,
            hours: entry?.hours || 0,
        };
    });

    const max = Math.max(...data.map(d => d.hours));
    const calculatedMax = max > 0 ? Math.max(max, 2) : 1; 
    
    return { chartData: data, maxHours: calculatedMax };
  }, [entries, currentDate]);

  const weeklyTotals = useMemo(() => {
    const today = new Date();
    const isCurrentMonthView = today.getFullYear() === currentDate.getFullYear() && today.getMonth() === currentDate.getMonth();
    
    const referenceDate = isCurrentMonthView ? today : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const dayOfWeek = (referenceDate.getDay() + 6) % 7; 
    
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
  const startDayOfWeek = (startOfMonth.getDay() + 6) % 7;

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
        className={`py-2 flex flex-col items-center justify-start min-h-[55px] cursor-pointer rounded-2xl transition-all duration-300 ${hasEntry ? 'bg-white/10 scale-105 shadow-sm border border-white/10' : 'hover:bg-white/5'}`} 
        onClick={() => handleDateClick(dateString)}
      >
        <time 
          dateTime={dateString} 
          className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'text-white'} ${hasEntry && !isToday ? 'font-bold text-primary-light' : ''}`}
        >
          {i}
        </time>
        {hasEntry && (
            <div className="mt-1 text-[10px] font-bold text-white bg-primary/20 border border-primary/30 px-2 py-0.5 rounded-full">
                {entryForDay.hours % 1 === 0 ? `${entryForDay.hours}` : `${entryForDay.hours.toFixed(1)}`}
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
  
  const handleStopwatchSave = (recordedHours: number) => {
      const today = new Date().toISOString().split('T')[0];
      const existingEntry = entries.find(e => e.date === today);
      
      const roundedHours = Math.round(recordedHours * 100) / 100;

      if(existingEntry) {
          onAddOrUpdateEntry({
              ...existingEntry,
              hours: (existingEntry.hours || 0) + roundedHours
          });
      } else {
          onAddOrUpdateEntry({
              id: today,
              date: today,
              hours: roundedHours
          });
      }
  };

  return (
    <div className="px-4 py-2 animate-fade-in">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
          {currentDate.toLocaleString('es-ES', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())} <span className="text-textSecondary font-light">{currentDate.getFullYear()}</span>
        </h2>
        <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-white/10 text-textSecondary transition-colors"><ChevronLeftIcon className="h-5 w-5" /></button>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-white/10 text-textSecondary transition-colors"><ChevronRightIcon className="h-5 w-5" /></button>
        </div>
      </div>
      
      <Stopwatch onSave={handleStopwatchSave} />
      
      {/* Progress Card - Glassmorphism */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 mb-6 overflow-hidden relative shadow-glass">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <h3 className="font-bold text-lg text-white mb-2 text-center relative z-10">Progreso Mensual</h3>
        <div className="text-center mb-5 relative z-10">
          <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-300 tracking-tighter drop-shadow-lg">{totalHoursThisMonth.toFixed(1)}</span>
          <span className="text-xl font-semibold text-textSecondary ml-2">hrs</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-4 mb-3 overflow-hidden shadow-inner border border-white/5">
            <div className="bg-gradient-to-r from-primary to-cyan-400 h-4 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(6,182,212,0.6)]" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <div className="flex justify-between text-sm font-semibold text-textSecondary px-1">
            <span>Meta: {monthlyGoal}h</span>
            <span>Faltan {remainingHours.toFixed(1)}h</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Charts */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-glass">
            <h3 className="font-bold text-lg text-white mb-6">Actividad Diaria</h3>
            <div className="h-40 flex items-end justify-between gap-1 pb-2" role="figure" aria-label="Gráfico de horas">
            {chartData.map(item => (
                <div key={item.day} className="flex-1 h-full flex flex-col items-center justify-end group relative">
                <div 
                    className="w-full max-w-[8px] bg-white/5 rounded-full transition-all duration-500 ease-out group-hover:bg-primary overflow-hidden relative border border-white/5"
                    style={{ height: `${item.hours > 0 ? Math.max((item.hours / maxHours) * 100, 10) : 5}%` }}
                >
                    {item.hours > 0 && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-cyan-400 h-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>}
                </div>
                {item.hours > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-primary text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 shadow-lg -translate-y-1 group-hover:translate-y-0">
                     {item.hours.toFixed(1)}h
                    </div>
                )}
                </div>
            ))}
            </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-glass">
            <h3 className="font-bold text-lg text-white mb-4">Esta Semana</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors">
                    <p className="text-2xl font-black text-white">{weeklyTotals.hours.toFixed(1)}</p>
                    <p className="text-[9px] font-bold text-textSecondary uppercase tracking-wider mt-1">Horas</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors">
                    <p className="text-2xl font-black text-white">{weeklyTotals.placements}</p>
                    <p className="text-[9px] font-bold text-textSecondary uppercase tracking-wider mt-1">Pubs</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors">
                    <p className="text-2xl font-black text-white">{weeklyTotals.videos}</p>
                    <p className="text-[9px] font-bold text-textSecondary uppercase tracking-wider mt-1">Videos</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 flex flex-col justify-center hover:bg-white/10 transition-colors">
                    <p className="text-2xl font-black text-white">{weeklyTotals.returnVisits}</p>
                    <p className="text-[9px] font-bold text-textSecondary uppercase tracking-wider mt-1">Revis.</p>
                </div>
            </div>
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
      
      <button 
        onClick={handleAddClick} 
        className="fixed bottom-24 right-6 bg-gradient-to-r from-primary to-blue-600 text-white rounded-[1.2rem] p-4 shadow-[0_0_20px_rgba(59,130,246,0.6)] z-40 transform transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-90 border border-white/20"
        aria-label="Añadir entrada"
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default ServiceLogView;