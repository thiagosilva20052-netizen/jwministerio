
import React, { useState, useMemo } from 'react';
import { SchoolAssignment, MeetingDuty } from '../types';
import { PlusIcon, TrashIcon, PencilIcon, BellIcon, SparklesIcon, CheckIcon, BookOpenIcon, UsersIcon } from './icons';

type Item = SchoolAssignment | MeetingDuty;
type ItemType = 'school' | 'duty';

interface MeetingsViewProps {
  schoolAssignments: SchoolAssignment[];
  meetingDuties: MeetingDuty[];
  onAddSchool: (item: Omit<SchoolAssignment, 'id'>) => void;
  onUpdateSchool: (item: SchoolAssignment) => void;
  onDeleteSchool: (id: string) => void;
  onAddDuty: (item: Omit<MeetingDuty, 'id'>) => void;
  onUpdateDuty: (item: MeetingDuty) => void;
  onDeleteDuty: (id: string) => void;
  onOpenAssistant: () => void;
}

const MeetingsFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, type: ItemType) => void;
  onDelete: () => void;
  initialData?: Item | null;
  initialType?: ItemType;
}> = ({ isOpen, onClose, onSubmit, onDelete, initialData, initialType = 'school' }) => {
  const [type, setType] = useState<ItemType>(initialType);
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [field1, setField1] = useState(''); // Student or Person
  const [field2, setField2] = useState(''); // Assignment or Duty
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const isSchool = 'student' in initialData;
        setType(isSchool ? 'school' : 'duty');
        setDate(initialData.date);
        setEndDate(initialData.endDate || '');
        setField1(isSchool ? (initialData as SchoolAssignment).student : (initialData as MeetingDuty).person);
        setField2(isSchool ? (initialData as SchoolAssignment).assignment : (initialData as MeetingDuty).duty);
        setReminderEnabled(!!initialData.reminder);
        setReminderDateTime(initialData.reminder || '');
      } else {
        setType(initialType);
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        setEndDate('');
        setField1('');
        setField2('');
        setReminderEnabled(false);
        setReminderDateTime('');
      }
    }
  }, [isOpen, initialData, initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      id: initialData?.id,
      date,
      endDate: endDate || undefined,
      reminder: reminderEnabled ? reminderDateTime : undefined,
      ...(type === 'school' ? { student: field1, assignment: field2 } : { person: field1, duty: field2 })
    };
    onSubmit(data, type);
    onClose();
  };

  const handleReminderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    if (isEnabled) {
        if (!('Notification' in window)) {
            setNotificationMessage('Navegador no soporta notificaciones.');
            return;
        }
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
            setReminderEnabled(true);
             if (!reminderDateTime) {
                const d = new Date(date + 'T19:00:00');
                setReminderDateTime(d.toISOString().slice(0, 16));
            }
        } else {
            setReminderEnabled(false);
            setNotificationMessage('Permiso denegado.');
        }
    } else {
        setReminderEnabled(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={!isConfirmOpen ? onClose : undefined}>
      <div className={`bg-[#1E293B] border-t border-white/10 p-6 pb-10 rounded-t-[2rem] shadow-2xl w-full max-w-[480px] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6"></div>
        
        <div className="flex gap-4 mb-6">
            <button 
                type="button" 
                onClick={() => !initialData && setType('school')}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${type === 'school' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-textSecondary border-transparent'}`}
            >
                Vida y Ministerio
            </button>
            <button 
                type="button"
                onClick={() => !initialData && setType('duty')} 
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${type === 'duty' ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : 'bg-white/5 text-textSecondary border-transparent'}`}
            >
                Deberes
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1">Fecha Inicio</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="appearance-none border-none bg-white/5 rounded-2xl w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
              </div>
              <div>
                <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1">Fecha Fin (Opc)</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={date} className="appearance-none border-none bg-white/5 rounded-2xl w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
              </div>
          </div>

          <div>
            <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1">{type === 'school' ? 'Estudiante' : 'Asignado'}</label>
            <input type="text" value={field1} onChange={e => setField1(e.target.value)} required className="appearance-none border border-white/10 rounded-2xl w-full py-4 px-5 text-white bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Nombre..." />
          </div>
          
          <div>
            <label className="block text-textSecondary text-xs font-bold uppercase tracking-wider mb-2 ml-1">{type === 'school' ? 'Asignación' : 'Deber'}</label>
            <input type="text" value={field2} onChange={e => setField2(e.target.value)} required className="appearance-none border border-white/10 rounded-2xl w-full py-4 px-5 text-white bg-black/20 leading-tight focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Descripción..." />
          </div>

          <div className="pt-2 space-y-3">
            <label className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-white/5">
              <input type="checkbox" checked={reminderEnabled} onChange={handleReminderChange} className="h-5 w-5 text-primary rounded bg-black/40 border-gray-600 focus:ring-primary" />
              <span className="text-sm font-medium text-white">Recordatorio</span>
            </label>
          </div>
          
          {reminderEnabled && (
             <div className="animate-fade-in">
                <input type="datetime-local" value={reminderDateTime} onChange={e => setReminderDateTime(e.target.value)} className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-3 px-4 focus:ring-primary focus:border-primary" />
             </div>
          )}
          
           <div className="flex items-center gap-3 pt-6">
             {initialData && (
                <button type="button" onClick={() => setIsConfirmOpen(true)} className="bg-red-500/10 text-red-400 p-4 rounded-2xl border border-red-500/20">
                  <TrashIcon className="h-6 w-6" />
                </button>
             )}
            <div className="flex-grow"></div>
            <button type="button" onClick={onClose} className="bg-white/5 text-white font-bold py-4 px-6 rounded-2xl border border-white/5">Cancelar</button>
            <button type="submit" className="bg-primary text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/30">Guardar</button>
          </div>
        </form>
      </div>

      {isConfirmOpen && (
         <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-[60]" onClick={() => setIsConfirmOpen(false)}>
            <div className="bg-[#1E293B] p-8 rounded-3xl border border-white/10 m-4 max-w-xs w-full text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">¿Eliminar?</h2>
                <div className="flex flex-col gap-3">
                    <button onClick={() => { onDelete(); onClose(); }} className="bg-red-500 text-white font-bold py-3 rounded-xl">Sí, eliminar</button>
                    <button onClick={() => setIsConfirmOpen(false)} className="bg-white/10 text-white font-bold py-3 rounded-xl">Cancelar</button>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

const MeetingsView: React.FC<MeetingsViewProps> = ({ schoolAssignments, meetingDuties, onAddSchool, onUpdateSchool, onDeleteSchool, onAddDuty, onUpdateDuty, onDeleteDuty, onOpenAssistant }) => {
  const [filter, setFilter] = useState<'ALL' | 'SCHOOL' | 'DUTY'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const allItems = useMemo(() => {
    const school = schoolAssignments.map(i => ({ ...i, type: 'school' as const }));
    const duties = meetingDuties.map(i => ({ ...i, type: 'duty' as const }));
    return [...school, ...duties].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schoolAssignments, meetingDuties]);

  const filteredItems = useMemo(() => {
    if (filter === 'SCHOOL') return allItems.filter(i => i.type === 'school');
    if (filter === 'DUTY') return allItems.filter(i => i.type === 'duty');
    return allItems;
  }, [allItems, filter]);

  const { pending, completed } = useMemo(() => {
    return {
        pending: filteredItems.filter(i => !i.completed),
        completed: filteredItems.filter(i => i.completed)
    };
  }, [filteredItems]);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any, type: ItemType) => {
    if (type === 'school') {
      data.id ? onUpdateSchool(data) : onAddSchool(data);
    } else {
      data.id ? onUpdateDuty(data) : onAddDuty(data);
    }
  };

  const toggleComplete = (item: any) => {
    const updated = { ...item, completed: !item.completed };
    // Remove the temporary 'type' property before saving
    const { type, ...cleanItem } = updated; 
    if (item.type === 'school') onUpdateSchool(cleanItem);
    else onUpdateDuty(cleanItem);
  };

  const renderItem = (item: any) => {
    const isSchool = item.type === 'school';
    return (
       <div key={item.id} className={`bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/5 hover:bg-white/5 transition-all mb-3 flex items-center gap-4 ${item.completed ? 'opacity-50' : 'shadow-glass'}`}>
          <button onClick={() => toggleComplete(item)} className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-primary border-primary text-white' : 'border-gray-500 bg-black/20'}`}>
              {item.completed && <CheckIcon className="h-4 w-4" />}
          </button>
          <div className="flex-grow min-w-0" onClick={() => handleEdit(item)}>
             <div className="flex items-center gap-2 mb-1">
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isSchool ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                     {isSchool ? 'Escuela' : 'Deber'}
                 </span>
                 <span className="text-xs text-textSecondary">{new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
             </div>
             <h4 className={`font-bold text-white truncate ${item.completed ? 'line-through' : ''}`}>{isSchool ? item.assignment : item.duty}</h4>
             <p className="text-sm text-textSecondary truncate">{isSchool ? item.student : item.person}</p>
          </div>
          <div className="flex flex-col gap-2">
             {item.reminder && <BellIcon className="h-4 w-4 text-accent-cyan" />}
             <button onClick={() => handleEdit(item)} className="p-2 rounded-full bg-white/5 text-textSecondary hover:text-white"><PencilIcon className="h-4 w-4" /></button>
          </div>
       </div>
    );
  };

  return (
    <div className="px-4 py-4 pb-32 animate-fade-in min-h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white tracking-tight">Reuniones</h2>
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                <button onClick={() => setFilter('ALL')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-white/10 text-white' : 'text-textSecondary'}`}>Todo</button>
                <button onClick={() => setFilter('SCHOOL')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'SCHOOL' ? 'bg-blue-500/20 text-blue-300' : 'text-textSecondary'}`}>V. y M.</button>
                <button onClick={() => setFilter('DUTY')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'DUTY' ? 'bg-purple-500/20 text-purple-300' : 'text-textSecondary'}`}>Deberes</button>
            </div>
        </div>

        <div className="flex-grow">
            {pending.length === 0 && completed.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4"><BookOpenIcon className="h-8 w-8 opacity-50" /></div>
                    <p className="text-textSecondary">No tienes asignaciones pendientes.</p>
                </div>
            ) : (
                <>
                   {pending.map(renderItem)}
                   {completed.length > 0 && (
                       <div className="mt-8">
                           <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-4 px-2 opacity-60">Completadas</h3>
                           {completed.map(renderItem)}
                       </div>
                   )}
                </>
            )}
        </div>
        
        {/* AI Assistant Button */}
        <div className="mt-6 mb-20">
            <button 
                onClick={onOpenAssistant}
                className="w-full bg-gradient-to-r from-[#2C2C3E] to-[#1F1F2E] border border-white/10 rounded-2xl p-4 flex items-center justify-between group hover:border-primary/30 transition-all shadow-lg"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-white">Preparar con IA</h4>
                        <p className="text-xs text-textSecondary">Investiga tu asignación</p>
                    </div>
                </div>
                <div className="bg-white/5 p-2 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                    <UsersIcon className="h-5 w-5" />
                </div>
            </button>
        </div>

        <button 
            onClick={() => { setEditingItem(null); setIsModalOpen(true); }} 
            className="fixed bottom-24 right-6 bg-gradient-to-r from-primary to-blue-600 text-white rounded-[1.2rem] p-4 shadow-[0_0_20px_rgba(59,130,246,0.6)] z-40 transition-transform active:scale-90 hover:scale-110 border border-white/20"
        >
            <PlusIcon className="h-7 w-7" />
        </button>

        <MeetingsFormModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            onDelete={() => { if(editingItem) { editingItem.type === 'school' ? onDeleteSchool(editingItem.id) : onDeleteDuty(editingItem.id) } }}
            initialData={editingItem}
            initialType={filter === 'DUTY' ? 'duty' : 'school'}
        />
    </div>
  );
};

export default MeetingsView;
