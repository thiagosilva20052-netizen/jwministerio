
import React, { useState, useEffect, useRef } from 'react';
import { MinistryActivity, Shift } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, PencilIcon, BellIcon, SparklesIcon, UsersIcon } from './icons';
import AIImportModal from './AIImportModal';


interface CalendarViewProps {
  activities: MinistryActivity[];
  onAddActivity: (activity: Omit<MinistryActivity, 'id'>) => void;
  onUpdateActivity: (activity: MinistryActivity) => void;
  onDeleteActivity: (id: string) => void;
}

const MinistryFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activity: Omit<MinistryActivity, 'id'> | MinistryActivity) => void;
  onDelete: (id: string) => void;
  initialData?: MinistryActivity | null;
  selectedDate: string;
}> = ({ isOpen, onClose, onSubmit, onDelete, initialData, selectedDate }) => {
  const [territory, setTerritory] = useState('');
  const [leader, setLeader] = useState('');
  const [shift, setShift] = useState(Shift.MORNING);
  const [description, setDescription] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  const getDefaultReminderTime = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    d.setHours(9); 
    d.setMinutes(0);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTerritory(initialData.territory);
        setLeader(initialData.leader);
        setShift(initialData.shift);
        setDescription(initialData.description || '');
        setReminderEnabled(!!initialData.reminder);
        setReminderDateTime(initialData.reminder || getDefaultReminderTime(initialData.date));
      } else {
        setTerritory('');
        setLeader('');
        setShift(Shift.MORNING);
        setDescription('');
        setReminderEnabled(false);
        setReminderDateTime(getDefaultReminderTime(selectedDate));
      }
      setNotificationMessage(null);
      setValidationError('');
    }
  }, [initialData, isOpen, selectedDate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(''); 

    if (reminderEnabled) {
      if (!reminderDateTime) {
        setValidationError('Por favor, selecciona una fecha y hora válidas para el recordatorio.');
        return;
      }
      const reminderDate = new Date(reminderDateTime);
      const now = new Date();
      if (reminderDate <= now) {
        setValidationError('La fecha del recordatorio no puede ser en el pasado. Por favor, elige una fecha futura.');
        return;
      }
    }

    if (territory && leader) {
      onSubmit({
        ...(initialData || {}),
        id: initialData?.id,
        date: initialData?.date || selectedDate,
        territory,
        leader,
        shift,
        description,
        reminder: reminderEnabled ? reminderDateTime : undefined,
      });
      onClose();
    }
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
  
  const handleReminderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setNotificationMessage(null);

    if (!isEnabled) {
      setReminderEnabled(false);
      return;
    }

    if (!('Notification' in window)) {
      setNotificationMessage('Este navegador no soporta notificaciones.');
      e.target.checked = false;
      return;
    }

    let permission = Notification.permission;
    
    if (permission === 'denied') {
      setNotificationMessage('Las notificaciones están bloqueadas. Para habilitarlas, busca el icono del candado (🔒) en la barra de direcciones de tu navegador, haz clic en él y permite las notificaciones para este sitio.');
      e.target.checked = false;
      return;
    }

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      setReminderEnabled(true);
    } else {
      setReminderEnabled(false);
      setNotificationMessage('Permiso denegado. Para recibir recordatorios, necesitas permitir las notificaciones.');
      e.target.checked = false;
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-end z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={!isConfirmOpen ? onClose : undefined}>
      <div className={`bg-surface dark:bg-[#1C1C1E] p-6 pb-10 rounded-t-[2.5rem] shadow-2xl w-full max-w-[480px] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} border-t border-white/20 dark:border-white/5`} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-8"></div>
        <h2 className="text-2xl font-bold mb-6 text-textPrimary dark:text-darkTextPrimary px-1 tracking-tight">{initialData ? 'Editar Actividad' : 'Nueva Actividad'}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="date">Fecha</label>
            <input type="date" id="date" value={initialData?.date || selectedDate} readOnly className="appearance-none border-none bg-gray-100 dark:bg-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="territory">Territorio</label>
              <input id="territory" type="text" value={territory} onChange={e => setTerritory(e.target.value)} required className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm" placeholder="Ej. Calle Principal 12" />
            </div>
            <div>
              <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="leader">Dirige</label>
              <input id="leader" type="text" value={leader} onChange={e => setLeader(e.target.value)} required className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm" placeholder="Nombre del hermano/a" />
            </div>
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="description">Notas (Opcional)</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm resize-none"
              placeholder="Detalles adicionales..."
            />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="shift">Turno</label>
            <div className="relative">
              <select id="shift" value={shift} onChange={e => setShift(e.target.value as Shift)} className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm">
                <option value={Shift.MORNING}>Mañana</option>
                <option value={Shift.AFTERNOON}>Tarde</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-textSecondary">
                <ChevronRightIcon className="h-4 w-4 rotate-90" />
              </div>
            </div>
          </div>
           <div className="pt-2 space-y-3">
            <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={handleReminderChange}
                className="form-checkbox h-5 w-5 text-primary rounded-lg focus:ring-primary border-gray-300 dark:border-gray-600 bg-white dark:bg-white/10"
              />
              <span className="text-sm font-medium text-textPrimary dark:text-darkTextPrimary">Activar recordatorio</span>
            </label>
             {notificationMessage && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl">
                    <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">{notificationMessage}</p>
                </div>
            )}
          </div>
          {reminderEnabled && (
            <div className="animate-[fade-in_0.2s_ease-out]">
              <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="reminder-time">Fecha y hora</label>
              <input
                type="datetime-local"
                id="reminder-time"
                value={reminderDateTime}
                onChange={e => setReminderDateTime(e.target.value)}
                className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
              />
              {validationError && <p className="text-sm text-red-500 mt-2 font-medium px-1">{validationError}</p>}
            </div>
          )}
          
          <div className="flex items-center gap-3 pt-6">
             {initialData && (
                <button type="button" onClick={handleDelete} className="bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold p-4 rounded-2xl transition-all active:scale-95 flex-shrink-0" aria-label="Eliminar">
                  <TrashIcon className="h-6 w-6" />
                </button>
             )}
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-textPrimary dark:text-darkTextPrimary font-bold py-4 px-6 rounded-2xl transition-all active:scale-95">
              Cancelar
            </button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transform transition-all active:scale-95">
              Guardar
            </button>
          </div>
        </form>
      </div>

      {isConfirmOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-40" onClick={() => setIsConfirmOpen(false)}>
            <div className="bg-surface dark:bg-[#1C1C1E] p-8 rounded-3xl shadow-2xl w-full max-w-xs m-4 animate-[scale-up_0.2s_ease-out] border border-white/20 dark:border-white/5" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                   <TrashIcon className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-center mb-2 text-textPrimary dark:text-darkTextPrimary">¿Eliminar actividad?</h2>
                <p className="text-center text-textSecondary dark:text-darkTextSecondary mb-8 leading-relaxed text-sm">Esta acción no se puede deshacer y se borrará de tu historial.</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirmDelete}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-5 rounded-2xl shadow-lg shadow-red-500/30 transition-all active:scale-95"
                    >
                        Sí, eliminar
                    </button>
                    <button
                        onClick={() => setIsConfirmOpen(false)}
                        className="w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-textPrimary dark:text-darkTextPrimary font-bold py-4 px-5 rounded-2xl transition-all active:scale-95"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const CalendarView: React.FC<CalendarViewProps> = ({ activities, onAddActivity, onUpdateActivity, onDeleteActivity }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalState, setModalState] = useState<'closed' | 'form'>('closed');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingActivity, setEditingActivity] = useState<MinistryActivity | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const agendaRef = useRef<HTMLDivElement>(null);

  // Helpers for Agenda Date Calculation
  const getWeekDates = (baseDateStr: string) => {
    const date = new Date(baseDateStr + 'T00:00:00');
    const day = date.getDay(); // 0=Sun, 1=Mon...
    const diffToMon = day === 0 ? 6 : day - 1; // Adjust so Monday is index 0
    const monday = new Date(date);
    monday.setDate(date.getDate() - diffToMon);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      week.push(`${year}-${month}-${dayStr}`);
    }
    return week;
  };

  const weekDates = getWeekDates(selectedDate);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDayOfWeek = (startOfMonth.getDay() + 6) % 7; // Lunes = 0
  
  const days = Array.from({ length: startDayOfWeek }, (_, i) => <div key={`empty-${i}`} className=""></div>);

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    const dateString = dayDate.toISOString().split('T')[0];
    const activitiesForDay = activities.filter(a => a.date === dateString);
    const isToday = dateString === new Date().toISOString().split('T')[0];
    const isSelected = dateString === selectedDate;

    days.push(
      <div 
        key={i} 
        className="relative flex flex-col items-center justify-start min-h-[50px] cursor-pointer group"
        onClick={() => handleDateClick(dateString)}
      >
        <time 
          dateTime={dateString} 
          className={`
            text-sm w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
            ${isSelected ? 'bg-primary text-white font-bold shadow-lg shadow-primary/40 scale-105' : 
              isToday ? 'bg-primary/10 text-primary font-bold' : 'text-textPrimary dark:text-darkTextPrimary hover:bg-gray-100 dark:hover:bg-white/10'}
          `}
        >
          {i}
        </time>
        {activitiesForDay.length > 0 && (
          <div className="mt-1 flex gap-0.5 justify-center">
              {activitiesForDay.slice(0, 3).map((_, idx) => (
                 <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-primary/30' : 'bg-primary'}`}></div>
              ))}
          </div>
        )}
      </div>
    );
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };
  
  const handleAddClick = () => {
    setEditingActivity(null);
    setModalState('form');
  };

  const handleAddForDate = (date: string) => {
      setSelectedDate(date);
      setEditingActivity(null);
      setModalState('form');
  };

  const handleTransitionToForm = (activity: MinistryActivity) => {
    setEditingActivity(activity);
    setModalState('form');
  };

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleSubmit = (activityData: Omit<MinistryActivity, 'id'> | MinistryActivity) => {
    if ('id' in activityData && activityData.id) {
        onUpdateActivity(activityData as MinistryActivity);
    } else {
        onAddActivity(activityData);
    }
  };
  
  const handleImport = (activitiesToImport: Omit<MinistryActivity, 'id'>[]) => {
    activitiesToImport.forEach(activity => {
      onAddActivity(activity);
    });
    setIsImportModalOpen(false);
  };

  const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="px-4 py-2 animate-fade-in">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-3xl font-bold text-textPrimary dark:text-darkTextPrimary capitalize tracking-tight">
          {currentDate.toLocaleString('es-ES', { month: 'long' })} <span className="text-textSecondary dark:text-darkTextSecondary font-medium">{currentDate.getFullYear()}</span>
        </h2>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsImportModalOpen(true)} className="p-3 rounded-full bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary transition-all shadow-soft active:scale-95 border border-gray-100 dark:border-white/5" aria-label="Importar con IA">
            <SparklesIcon className="h-5 w-5 text-amber-500" />
          </button>
          <div className="flex bg-white dark:bg-white/5 rounded-full p-1 shadow-soft border border-gray-100 dark:border-white/5">
              <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary transition-colors"><ChevronLeftIcon className="h-5 w-5" /></button>
              <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary transition-colors"><ChevronRightIcon className="h-5 w-5" /></button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-[#1C1C1E] shadow-soft dark:shadow-none rounded-[2rem] p-6 mb-8 border border-gray-100 dark:border-white/5 relative overflow-hidden">
        <div className="grid grid-cols-7 mb-4">
            {weekdays.map(day => (
              <div key={day} className="text-center font-bold text-xs text-textSecondary dark:text-darkTextSecondary uppercase tracking-wider opacity-60">{day}</div>
            ))}
        </div>
        <div className="grid grid-cols-7 gap-y-4">
            {days}
        </div>
      </div>

      {/* Weekly Agenda */}
      <div ref={agendaRef} className="animate-slide-up">
        <div className="flex items-center justify-between px-3 mb-5">
            <h3 className="text-xl font-bold text-textPrimary dark:text-darkTextPrimary tracking-tight">Agenda Semanal</h3>
             <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                {new Date(weekDates[0]).toLocaleDateString('es-ES', { day: 'numeric' })} - {new Date(weekDates[6]).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
        </div>
        
        <div className="space-y-5 pb-32">
            {weekDates.map((dateStr) => {
                const dateObj = new Date(dateStr + 'T00:00:00');
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayActivities = activities.filter(a => a.date === dateStr).sort((a, b) => {
                    if (a.shift === b.shift) return 0;
                    return a.shift === Shift.MORNING ? -1 : 1;
                });
                const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
                
                return (
                    <div key={dateStr} className={`transition-all duration-500 rounded-3xl overflow-hidden ${isSelected ? 'bg-white dark:bg-[#1C1C1E] shadow-glow ring-1 ring-primary/20' : 'bg-white/60 dark:bg-white/5'}`}>
                        <div className={`px-5 py-4 flex justify-between items-center ${isSelected ? 'bg-gradient-to-r from-primary/5 to-transparent' : ''}`}>
                            <div className="flex items-baseline gap-3">
                                <span className={`capitalize font-bold text-lg ${isSelected || isToday ? 'text-primary dark:text-primary-light' : 'text-textSecondary dark:text-darkTextSecondary'}`}>{dayName}</span>
                                <span className={`text-lg ${isSelected || isToday ? 'text-primary dark:text-primary-light font-bold' : 'text-textSecondary dark:text-darkTextSecondary opacity-60'}`}>{dateObj.getDate()}</span>
                            </div>
                            <button onClick={() => handleAddForDate(dateStr)} className="w-9 h-9 rounded-full bg-gray-50 dark:bg-white/10 hover:bg-primary hover:text-white text-primary dark:text-white flex items-center justify-center transition-all shadow-sm active:scale-90">
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="px-2 pb-2">
                            {dayActivities.length === 0 ? (
                                isSelected && (
                                    <div className="pb-4 text-center cursor-pointer" onClick={() => handleAddForDate(dateStr)}>
                                        <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl py-3 mx-2 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                                            <span className="text-sm text-textSecondary/50 dark:text-darkTextSecondary/50 font-medium group-hover:text-primary transition-colors">Sin actividades</span>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-2 px-2 pb-3">
                                    {dayActivities.map(activity => (
                                        <div 
                                            key={activity.id} 
                                            onClick={() => handleTransitionToForm(activity)}
                                            className="bg-gray-50 dark:bg-black/30 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-primary/5 dark:hover:bg-white/10 transition-all group border border-transparent hover:border-primary/10"
                                        >
                                          <div className="min-w-0">
                                             <div className="flex items-center gap-2.5 mb-1.5">
                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${activity.shift === Shift.MORNING ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-200'}`}>
                                                   {activity.shift === Shift.MORNING ? 'Mañana' : 'Tarde'}
                                                </span>
                                                <span className="font-bold text-textPrimary dark:text-darkTextPrimary truncate">{activity.territory}</span>
                                             </div>
                                             <div className="flex items-center gap-2 text-xs text-textSecondary dark:text-darkTextSecondary pl-0.5">
                                                <UsersIcon className="h-3.5 w-3.5 opacity-70" />
                                                <span className="truncate font-medium">{activity.leader}</span>
                                             </div>
                                             {activity.reminder && (
                                                 <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold pl-0.5">
                                                     <BellIcon className="h-3.5 w-3.5" />
                                                     <span>{new Date(activity.reminder).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                 </div>
                                             )}
                                          </div>
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">
                                            <PencilIcon className="h-4 w-4" />
                                          </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
      
      <MinistryFormModal
        isOpen={modalState === 'form'}
        onClose={() => setModalState('closed')}
        onSubmit={handleSubmit}
        onDelete={onDeleteActivity}
        initialData={editingActivity}
        selectedDate={selectedDate}
      />

      <AIImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      <button 
        onClick={handleAddClick} 
        className="fixed bottom-28 right-6 bg-primary text-white rounded-[1.2rem] p-4 shadow-lg shadow-primary/40 z-20 transform transition-all duration-300 hover:scale-110 hover:shadow-primary/60 hover:-translate-y-1 active:scale-90 active:translate-y-0"
        aria-label="Añadir actividad"
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default CalendarView;
