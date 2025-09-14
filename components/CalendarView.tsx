import React, { useState, useEffect } from 'react';
import { MinistryActivity, Shift } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from './icons';

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
    }
  }, [initialData, isOpen, selectedDate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (territory && leader) {
      onSubmit({
        ...(initialData || {}),
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
    if (initialData && window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      onDelete(initialData.id);
      onClose();
    }
  };
  
  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    if (isEnabled && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    setReminderEnabled(isEnabled);
  }

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
      <div className={`bg-surface dark:bg-darkSurface p-5 pb-8 rounded-t-3xl shadow-xl w-full max-w-md transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5"></div>
        <h2 className="text-2xl font-bold mb-5 text-textPrimary dark:text-darkTextPrimary">{initialData ? 'Editar Actividad' : 'Añadir Actividad'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="date">Fecha</label>
            <input type="date" id="date" value={initialData?.date || selectedDate} readOnly className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-background dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="territory">Territorio</label>
            <input id="territory" type="text" value={territory} onChange={e => setTerritory(e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="leader">Dirige</label>
            <input id="leader" type="text" value={leader} onChange={e => setLeader(e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="description">Descripción (Opcional)</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Añade notas o detalles adicionales..."
            />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="shift">Turno</label>
            <select id="shift" value={shift} onChange={e => setShift(e.target.value as Shift)} className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary">
              <option value={Shift.MORNING}>Mañana</option>
              <option value={Shift.AFTERNOON}>Tarde</option>
            </select>
          </div>
           <div className="pt-2">
            <label className="flex items-center space-x-3 text-sm font-medium text-textSecondary dark:text-darkTextSecondary">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={handleReminderChange}
                className="form-checkbox h-5 w-5 text-primary rounded-md focus:ring-primary border-separator dark:border-darkSeparator bg-surface dark:bg-darkSurface"
              />
              <span>Activar recordatorio</span>
            </label>
          </div>
          {reminderEnabled && (
            <div className="pt-2">
              <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="reminder-time">Fecha y hora del recordatorio</label>
              <input
                type="datetime-local"
                id="reminder-time"
                value={reminderDateTime}
                onChange={e => setReminderDateTime(e.target.value)}
                className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
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


const CalendarView: React.FC<CalendarViewProps> = ({ activities, onAddActivity, onUpdateActivity, onDeleteActivity }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingActivity, setEditingActivity] = useState<MinistryActivity | null>(null);

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

    days.push(
      <div key={i} className="py-2 flex flex-col items-center justify-start min-h-[70px] cursor-pointer rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200" onClick={() => handleDateClick(dateString)}>
        <time dateTime={dateString} className={`text-base font-medium w-8 h-8 flex items-center justify-center rounded-full relative ${isToday ? 'text-primary font-bold' : 'text-textPrimary dark:text-darkTextPrimary'}`}>
          {isToday && <span className="absolute inset-0 rounded-full ring-2 ring-primary/70"></span>}
          {i}
        </time>
        <div className="flex items-center space-x-1 mt-2">
          {activitiesForDay.map(activity => (
            <div key={activity.id} onClick={(e) => { e.stopPropagation(); handleEditActivity(activity) }} className={`w-1.5 h-1.5 rounded-full ${activity.shift === Shift.MORNING ? 'bg-blue-500' : 'bg-orange-500'}`}>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setEditingActivity(null);
    setIsModalOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const handleEditActivity = (activity: MinistryActivity) => {
    setSelectedDate(activity.date);
    setEditingActivity(activity);
    setIsModalOpen(true);
  }

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

  const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  return (
    <div className="p-4 animate-[fade-in_0.5s_ease-in-out]">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-darkTextPrimary">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
        </h2>
        <div className="flex items-center space-x-1">
          <button onClick={() => changeMonth(-1)} className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary transition-colors"><ChevronLeftIcon className="h-6 w-6" /></button>
          <button onClick={() => changeMonth(1)} className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary transition-colors"><ChevronRightIcon className="h-6 w-6" /></button>
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
      
      <MinistryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={onDeleteActivity}
        initialData={editingActivity}
        selectedDate={selectedDate}
      />
      
      <button onClick={handleAddClick} className="fixed bottom-28 right-5 bg-primary hover:bg-primary-dark text-white rounded-2xl p-4 shadow-lg shadow-primary/40 z-20 transform transition-transform hover:scale-105 active:scale-95">
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default CalendarView;