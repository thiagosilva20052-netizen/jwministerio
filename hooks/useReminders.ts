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

  // Effect for cleaning up fired reminders for deleted items.
  // This runs whenever the main data lists change.
  useEffect(() => {
    const allIds = new Set([
        ...ministryActivities.map(i => i.id),
        ...schoolAssignments.map(i => i.id),
        ...meetingDuties.map(i => i.id)
    ]);

    setFiredReminders(currentFiredReminders => {
      // Create a new array containing only the reminder IDs that still exist.
      const validReminders = currentFiredReminders.filter(id => allIds.has(id));

      // If the length is the same, no reminders were cleaned up.
      // We return the original array reference to prevent unnecessary state updates.
      if (validReminders.length === currentFiredReminders.length) {
        return currentFiredReminders;
      }
      
      return validReminders;
    });
  }, [ministryActivities, schoolAssignments, meetingDuties, setFiredReminders]);

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
