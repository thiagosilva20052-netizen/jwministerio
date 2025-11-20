
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
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>('');

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
      setValidationError('');
    }
  }, [initialData, isOpen, type]);

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
     <div className={`fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-end z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={!isConfirmOpen ? onClose : undefined}>
      <div className={`bg-surface dark:bg-[#1C1C1E] p-6 pb-10 rounded-t-[2.5rem] shadow-2xl w-full max-w-[480px] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} border-t border-white/20 dark:border-white/5`} onClick={e => e.stopPropagation()}>
         <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-8"></div>
        <h2 className="text-2xl font-bold mb-6 text-textPrimary dark:text-darkTextPrimary px-1 tracking-tight">{`${title} ${typeTitle}`}</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="date">Fecha de inicio</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="appearance-none border-none bg-gray-100 dark:bg-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
          </div>
           <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="endDate">Fecha de finalización (Opcional)</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} min={date} className="appearance-none border-none bg-gray-100 dark:bg-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary leading-tight focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="field1">{field1Label}</label>
            <input id="field1" type="text" value={field1} onChange={e => setField1(e.target.value)} required className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm" />
          </div>
          <div>
            <label className="block text-textSecondary dark:text-darkTextSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1" htmlFor="field2">{field2Label}</label>
            <input id="field2" type="text" value={field2} onChange={e => setField2(e.target.value)} required className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm" />
          </div>
          <div className="pt-2 space-y-3">
            <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-white/10">
              <input type="checkbox" checked={reminderEnabled} onChange={handleReminderChange} className="form-checkbox h-5 w-5 text-primary rounded-lg focus:ring-primary border-gray-300 dark:border-gray-600 bg-white dark:bg-white/10" />
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
              <input type="datetime-local" id="reminder-time" value={reminderDateTime} onChange={e => setReminderDateTime(e.target.value)} className="appearance-none border border-gray-200 dark:border-white/10 rounded-2xl w-full py-4 px-5 text-textPrimary dark:text-darkTextPrimary bg-white dark:bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm" />
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
            <button type="button" onClick={onClose} className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-textPrimary dark:text-darkTextPrimary font-bold py-4 px-6 rounded-2xl transition-all active:scale-95">Cancelar</button>
            <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transform transition-all active:scale-95">Guardar</button>
          </div>
        </form>
      </div>

      {isConfirmOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-40" onClick={() => setIsConfirmOpen(false)}>
            <div className="bg-surface dark:bg-[#1C1C1E] p-8 rounded-3xl shadow-2xl w-full max-w-xs m-4 animate-[scale-up_0.2s_ease-out] border border-white/20 dark:border-white/5" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                   <TrashIcon className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-center mb-2 text-textPrimary dark:text-darkTextPrimary">¿Eliminar elemento?</h2>
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

type BaseProps = {
  onDeleteItem: (id: string) => void;
};

type SchoolProps = BaseProps & {
  items: SchoolAssignment[];
  type: 'school';
  onAddItem: (item: Omit<SchoolAssignment, 'id'>) => void;
  onUpdateItem: (item: SchoolAssignment) => void;
};

type DutyProps = BaseProps & {
  items: MeetingDuty[];
  type: 'duty';
  onAddItem: (item: Omit<MeetingDuty, 'id'>) => void;
  onUpdateItem: (item: MeetingDuty) => void;
};

type AssignmentListProps = SchoolProps | DutyProps;

const AssignmentList: React.FC<AssignmentListProps> = (props) => {
  const { items, type, onDeleteItem } = props;
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
      if (props.type === 'school' && 'student' in updatedItem) {
        props.onUpdateItem(updatedItem);
      } else if (props.type === 'duty' && 'person' in updatedItem) {
        props.onUpdateItem(updatedItem);
      }
  };

  const handleSubmit = (itemData: ItemWithoutId | Item) => {
    if (props.type === 'school' && 'student' in itemData) {
      if ('id' in itemData && itemData.id) {
        props.onUpdateItem(itemData);
      } else {
        props.onAddItem(itemData);
      }
    } else if (props.type === 'duty' && 'person' in itemData) {
      if ('id' in itemData && itemData.id) {
        props.onUpdateItem(itemData);
      } else {
        props.onAddItem(itemData);
      }
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
    completed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
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
    const textStyle = item.completed ? 'line-through opacity-50' : '';
    
    return (
      <div 
        key={item.id}
        className={`bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 flex items-center justify-between transition-all duration-300 shadow-soft dark:shadow-none border border-gray-100 dark:border-white/5 hover:scale-[1.02] ${item.completed ? 'opacity-70' : ''}`}
      >
        <div className="flex items-center space-x-4 flex-grow min-w-0">
            <div className="relative flex items-center justify-center">
              <input
                  type="checkbox"
                  checked={!!item.completed}
                  onChange={() => handleToggleComplete(item)}
                  className="h-6 w-6 rounded-lg text-primary focus:ring-primary border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-white/5 flex-shrink-0 cursor-pointer transition-all"
                  aria-label={`Marcar como completada`}
              />
            </div>
            <div className="flex-grow min-w-0">
              <p className={`font-bold text-textPrimary dark:text-darkTextPrimary truncate text-lg ${textStyle}`}>{mainText}</p>
              <p className={`text-sm text-textSecondary dark:text-darkTextSecondary truncate ${textStyle}`}>{subText}</p>
              {item.endDate && item.endDate !== item.date && (
                <p className="text-[10px] font-bold text-textSecondary dark:text-darkTextSecondary mt-1.5 bg-gray-100 dark:bg-white/5 w-fit px-2 py-1 rounded-md uppercase tracking-wider">
                    Finaliza: {new Date(item.endDate + 'T00:00:00').toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric',
                        ...(new Date(item.date).getFullYear() !== new Date(item.endDate).getFullYear() && { year: 'numeric' })
                    })}
                </p>
              )}
            </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
           {item.reminder && <BellIcon className="h-5 w-5 text-amber-500 drop-shadow-sm" />}
          <button onClick={() => handleEdit(item)} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 hover:bg-primary hover:text-white text-textSecondary dark:text-darkTextSecondary flex items-center justify-center transition-colors">
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="px-4 py-2 space-y-8 animate-fade-in pb-32">
      {pendingItems.length === 0 && completedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-textSecondary dark:text-darkTextSecondary py-24 px-4 opacity-60">
             <div className="w-20 h-20 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                 <PlusIcon className="h-8 w-8 opacity-50" />
             </div>
            <p className="text-lg font-medium">No hay {type === 'school' ? 'asignaciones' : 'deberes'} todavía.</p>
            <p className="mt-2 text-sm">Pulsa el botón <span className="inline-flex items-center justify-center align-middle w-6 h-6 bg-primary/10 text-primary rounded-md font-bold text-lg mx-1">+</span> para añadir una.</p>
        </div>
      ) : (
        <>
            {Object.entries(groupedPendingItems).map(([date, itemsForDate]) => (
              <div key={date}>
                <h3 className="text-xs font-bold text-textSecondary dark:text-darkTextSecondary tracking-widest uppercase pb-4 px-2 opacity-70">{date}</h3>
                <div className="space-y-3">
                  {(itemsForDate as Item[]).map(item => renderItem(item))}
                </div>
              </div>
            ))}
            
            {completedItems.length > 0 && (
                <div className="pt-8">
                    <h3 className="text-xs font-bold text-textSecondary dark:text-darkTextSecondary tracking-widest uppercase pb-4 px-2 border-t border-gray-200 dark:border-white/5 pt-8 opacity-70">Completadas</h3>
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

      <button 
        onClick={handleAdd} 
        className="fixed bottom-28 right-6 bg-primary text-white rounded-[1.2rem] p-4 shadow-lg shadow-primary/40 z-20 transform transition-all duration-300 hover:scale-110 hover:shadow-primary/60 hover:-translate-y-1 active:scale-90 active:translate-y-0"
        aria-label="Añadir nuevo"
      >
        <PlusIcon className="h-7 w-7" />
      </button>
    </div>
  );
};

export default AssignmentList;
