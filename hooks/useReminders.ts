import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { MinistryActivity, SchoolAssignment, MeetingDuty } from '../types';

type AllItems = (MinistryActivity | SchoolAssignment | MeetingDuty)[];

export const useReminders = (
  ministryActivities: MinistryActivity[],
  schoolAssignments: SchoolAssignment[],
  meetingDuties: MeetingDuty[]
) => {
  const [firedReminders, setFiredReminders] = useLocalStorage<string[]>('firedReminders', []);

  // Effect for cleaning up fired reminders for deleted items
  useEffect(() => {
    const allIds = new Set([
        ...ministryActivities.map(i => i.id),
        ...schoolAssignments.map(i => i.id),
        ...meetingDuties.map(i => i.id)
    ]);
    if (firedReminders.some(id => !allIds.has(id))) {
      setFiredReminders(prev => prev.filter(id => allIds.has(id)));
    }
  }, [ministryActivities, schoolAssignments, meetingDuties, firedReminders, setFiredReminders]);

  // Effect for checking and firing reminders
  useEffect(() => {
    const checkReminders = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const allItems: AllItems = [...ministryActivities, ...schoolAssignments, ...meetingDuties];
      const newFiredReminders: string[] = [];

      // We read from localStorage directly to get the latest value inside setInterval
      const currentFiredReminders = JSON.parse(window.localStorage.getItem('firedReminders') || '[]');

      allItems.forEach(item => {
        if (item.reminder && !currentFiredReminders.includes(item.id)) {
          const reminderDate = new Date(item.reminder);
          if (reminderDate <= now) {
            let title = 'Recordatorio';
            let body = '';

            if ('territory' in item) { // MinistryActivity
              title = 'Recordatorio de Ministerio';
              body = `Actividad en territorio ${item.territory}. Dirige: ${item.leader}.`;
            } else if ('assignment' in item) { // SchoolAssignment
              title = 'Recordatorio de Asignación';
              body = `Asignación: "${item.assignment}". Estudiante: ${item.student}.`;
            } else if ('duty' in item) { // MeetingDuty
              title = 'Recordatorio de Deber';
              body = `Deber: ${item.duty}. Asignado: ${item.person}.`;
            }
            
            new Notification(title, {
              body,
              icon: '/vite.svg',
            });
            
            newFiredReminders.push(item.id);
          }
        }
      });
      
      if (newFiredReminders.length > 0) {
        setFiredReminders(prev => [...prev, ...newFiredReminders]);
      }
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [ministryActivities, schoolAssignments, meetingDuties, setFiredReminders]);
};
