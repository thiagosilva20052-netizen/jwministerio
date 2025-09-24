import React, { useState, useEffect, useMemo } from 'react';
import { SchoolAssignment, MeetingDuty } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, BellIcon } from './icons';

type Item = SchoolAssignment | MeetingDuty;
type ItemWithoutId = Omit<SchoolAssignment, 'id'> | Omit<MeetingDuty, 'id'>;

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: ItemWithoutId | Item) => void;
  onDelete: (id: string) => void;
  initialData?: Item | null;
  type: 'school' | 'duty';
}

const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({ isOpen, onClose, onSubmit, onDelete, initialData, type }) => {
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [field1, setField1] = useState(''); // student or person
  const [field2, setField2] = useState(''); // assignment or duty
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const getDefaultReminderTime = (dateStr: string) => {
    const d = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    d.setHours(19);
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
        setDate(initialData.date);
        setEndDate(initialData.endDate || '');
        if (type === 'school') {
          setField1((initialData as SchoolAssignment).student);
          setField2((initialData as SchoolAssignment).assignment);
        } else {
          setField1((initialData as MeetingDuty).person);
          setField2((initialData as MeetingDuty).duty);
        }
        setReminderEnabled(!!initialData.reminder);
        setReminderDateTime(initialData.reminder || getDefaultReminderTime(initialData.date));
      } else {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        setEndDate('');
        setField1('');
        setField2('');
        setReminderEnabled(false);
        setReminderDateTime(getDefaultReminderTime(today));
      }
      setNotificationMessage(null);
    }
  }, [initialData, isOpen, type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reminderEnabled) {
      if (!reminderDateTime) {
        alert('Por favor, selecciona una fecha y hora válidas para el recordatorio.');
        return;
      }
      const reminderDate = new Date(reminderDateTime);
      const now = new Date();
      if (reminderDate <= now) {
        alert('La fecha del recordatorio no puede ser en el pasado. Por favor, elige una fecha futura.');
        return;
      }
    }

    if (date && field1 && field2) {
      const baseData = {
        ...(initialData || {}),
        id: initialData?.id,
        date,
        endDate: endDate || undefined,
        reminder: reminderEnabled ? reminderDateTime : undefined,
      };

      let submittedData: ItemWithoutId | Item;
      if (type === 'school') {
        submittedData = { ...baseData, student: field1, assignment: field2 };
      } else {
        submittedData = { ...baseData, person: field1, duty: field2 };
      }
      onSubmit(submittedData);
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

  const title = initialData ? 'Editar' : 'Añadir';
  const typeTitle = type === 'school' ? 'Asignación' : 'Deber';
  const field1Label = type === 'school' ? 'Estudiante' : 'Asignado';
  const field2Label = type === 'school' ? 'Asignación' : 'Deber';

  return (
     <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={!isConfirmOpen ? onClose : undefined}>
      <div className={`bg-surface dark:bg-darkSurface p-5 pb-8 rounded-t-3xl shadow-xl w-full max-w-md transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
         <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5"></div>
        <h2 className="text-2xl font-bold mb-5 text-textPrimary dark:text-darkTextPrimary">{`${title} ${typeTitle}`}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="date">Fecha de inicio</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
           <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="endDate">Fecha de finalización (Opcional)</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} min={date} className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="field1">{field1Label}</label>
            <input id="field1" type="text" value={field1} onChange={e => setField1(e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="field2">{field2Label}</label>
            <input id="field2" type="text" value={field2} onChange={e => setField2(e.target.value)} required className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="pt-2 space-y-3">
            <label className="flex items-center space-x-3 text-sm font-medium text-textSecondary dark:text-darkTextSecondary">
              <input type="checkbox" checked={reminderEnabled} onChange={handleReminderChange} className="form-checkbox h-5 w-5 text-primary rounded-md focus:ring-primary border-separator dark:border-darkSeparator bg-surface dark:bg-darkSurface" />
              <span>Activar recordatorio</span>
            </label>
            {notificationMessage && (
                <div className="bg-amber-500/15 p-3 rounded-xl">
                    <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">{notificationMessage}</p>
                </div>
            )}
          </div>
          {reminderEnabled && (
            <div className="pt-2">
              <label className="block text-textSecondary dark:text-darkTextSecondary text-sm font-medium mb-2" htmlFor="reminder-time">Fecha y hora del recordatorio</label>
              <input type="datetime-local" id="reminder-time" value={reminderDateTime} onChange={e => setReminderDateTime(e.target.value)} className="appearance-none border border-separator dark:border-darkSeparator rounded-xl w-full py-3 px-4 text-textPrimary dark:text-darkTextPrimary bg-surface dark:bg-darkSurface leading-tight focus:outline-none focus:ring-2 focus:ring-primary" />
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

      {isConfirmOpen && (
        <div className="absolute inset-0 bg-black/60 flex justify-center items-center z-40" onClick={() => setIsConfirmOpen(false)}>
            <div className="bg-surface dark:bg-darkSurface p-6 rounded-3xl shadow-xl w-full max-w-sm m-4 animate-[fade-in_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-center mb-2 text-textPrimary dark:text-darkTextPrimary">Confirmar Eliminación</h2>
                <p className="text-center text-textSecondary dark:text-darkTextSecondary mb-6">¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirmDelete}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-5 rounded-full transition-colors active:scale-95"
                    >
                        Eliminar
                    </button>
                    <button
                        onClick={() => setIsConfirmOpen(false)}
                        className="w-full bg-gray-500/15 text-textPrimary dark:text-darkTextPrimary font-bold py-3 px-5 rounded-full hover:bg-gray-500/25 transition-colors"
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

interface AssignmentListProps {
  items: Item[];
  type: 'school' | 'duty';
  onAddItem: (item: ItemWithoutId) => void;
  onUpdateItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
}

const AssignmentList: React.FC<AssignmentListProps> = ({ items, type, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  
  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  
  const handleToggleComplete = (item: Item) => {
      const updatedItem = { ...item, completed: !item.completed };
      onUpdateItem(updatedItem);
  };

  const handleSubmit = (itemData: ItemWithoutId | Item) => {
    if ('id' in itemData && itemData.id) {
        onUpdateItem(itemData as Item);
    } else {
        onAddItem(itemData);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  
  const { pendingItems, completedItems } = useMemo(() => {
    const pending = items.filter(item => !item.completed);
    const completed = items.filter(item => item.completed);

    pending.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Most recent completed first
    
    return { pendingItems: pending, completedItems: completed };
  }, [items]);

  const groupedPendingItems = useMemo(() => {
    return pendingItems.reduce((acc, item) => {
      const dateKey = formatDate(item.date);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, Item[]>);
  }, [pendingItems]);

  const renderItem = (item: Item) => {
    const isSchool = 'student' in item;
    const mainText = isSchool ? item.assignment : item.duty;
    const subText = isSchool ? item.student : item.person;
    const textStyle = item.completed ? 'line-through' : '';
    
    return (
      <div 
        key={item.id}
        className={`bg-surface dark:bg-darkSurface rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-lg shadow-slate-200/50 dark:shadow-black/20 ${item.completed ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center space-x-4 flex-grow min-w-0">
            <input
                type="checkbox"
                checked={!!item.completed}
                onChange={() => handleToggleComplete(item)}
                className="h-6 w-6 rounded-lg text-primary focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-darkSurface border-separator dark:border-darkSeparator bg-surface dark:bg-darkSurface flex-shrink-0 cursor-pointer"
                aria-label={`Marcar como completada`}
            />
            <div className="flex-grow min-w-0">
              <p className={`font-bold text-textPrimary dark:text-darkTextPrimary truncate ${textStyle}`}>{mainText}</p>
              <p className={`text-sm text-textSecondary dark:text-darkTextSecondary truncate ${textStyle}`}>{subText}</p>
              {item.endDate && item.endDate !== item.date && (
                <p className="text-xs text-textSecondary dark:text-darkTextSecondary mt-1">
                    Finaliza: {new Date(item.endDate + 'T00:00:00').toLocaleDateString('es-ES', { 
                        month: 'long', 
                        day: 'numeric',
                        ...(new Date(item.date).getFullYear() !== new Date(item.endDate).getFullYear() && { year: 'numeric' })
                    })}
                </p>
              )}
            </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0 pl-2">
           {item.reminder && <BellIcon className="h-5 w-5 text-amber-500" />}
          <button onClick={() => handleEdit(item)} className="p-2.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-textSecondary dark:text-darkTextSecondary">
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-4 space-y-8 animate-[fade-in_0.5s_ease-in-out]">
      {pendingItems.length === 0 && completedItems.length === 0 ? (
        <div className="text-center text-textSecondary dark:text-darkTextSecondary py-24 px-4">
            <p className="text-lg font-medium">No hay {type === 'school' ? 'asignaciones' : 'deberes'} todavía.</p>
            <p className="mt-2">Pulsa el botón <span className="inline-block mx-1 font-bold text-lg">+</span> para añadir una.</p>
        </div>
      ) : (
        <>
            {Object.entries(groupedPendingItems).map(([date, itemsForDate]) => (
              <div key={date}>
                <h3 className="text-sm font-bold text-textSecondary dark:text-darkTextSecondary tracking-wide uppercase pb-3 px-1 capitalize">{date}</h3>
                <div className="space-y-3">
                  {(itemsForDate as Item[]).map(item => renderItem(item))}
                </div>
              </div>
            ))}
            
            {completedItems.length > 0 && (
                <div className="pt-6">
                    <h3 className="text-sm font-bold text-textSecondary dark:text-darkTextSecondary tracking-wide uppercase pb-3 px-1 border-t-2 border-separator dark:border-darkSeparator pt-6">Completadas</h3>
                    <div className="space-y-3">
                        {completedItems.map(item => renderItem(item))}
                    </div>
                </div>
            )}
        </>
      )}

      <AssignmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={onDeleteItem}
        initialData={editingItem}
        type={type}
      />

      <button onClick={handleAdd} className="fixed bottom-28 right-5 bg-primary hover:bg-primary-dark text-white rounded-2xl p-4 shadow-lg shadow-primary/40 z-20 transform transition-transform hover:scale-105 active:scale-95">
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default AssignmentList;