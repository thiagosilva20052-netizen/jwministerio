import React, { useState, useEffect } from 'react';
import { View, MinistryActivity, SchoolAssignment, MeetingDuty, ServiceEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReminders } from './hooks/useReminders';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import AssignmentList from './components/AssignmentList';
import ServiceLogView from './components/ServiceLogView';
import AssistantModal from './components/AssistantModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CALENDAR);
  const [ministryActivities, setMinistryActivities] = useLocalStorage<MinistryActivity[]>('ministryActivities', []);
  const [schoolAssignments, setSchoolAssignments] = useLocalStorage<SchoolAssignment[]>('schoolAssignments', []);
  const [meetingDuties, setMeetingDuties] = useLocalStorage<MeetingDuty[]>('meetingDuties', []);
  const [serviceEntries, setServiceEntries] = useLocalStorage<ServiceEntry[]>('serviceEntries', []);
  const [appTitle, setAppTitle] = useLocalStorage<string>('appTitle', 'Asistente del Ministerio');

  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('isDarkMode', prefersDarkMode);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useReminders(ministryActivities, schoolAssignments, meetingDuties);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);


  const viewTitles: Record<View, string> = {
    [View.CALENDAR]: 'Ministerio',
    [View.SCHOOL]: 'Escuela',
    [View.DUTIES]: 'Operatividad',
    [View.SERVICE_LOG]: 'Registro de Servicio',
  };

  // Ministry CRUD
  const addMinistryActivity = (activity: Omit<MinistryActivity, 'id'>) => {
    const newActivity = { ...activity, id: new Date().toISOString() + Math.random() };
    setMinistryActivities([...ministryActivities, newActivity]);
  };
  const updateMinistryActivity = (updatedActivity: MinistryActivity) => {
    setMinistryActivities(ministryActivities.map(act => act.id === updatedActivity.id ? updatedActivity : act));
  };
  const deleteMinistryActivity = (id: string) => {
    setMinistryActivities(ministryActivities.filter(act => act.id !== id));
  };
  
  // School CRUD
  const addSchoolAssignment = (assignment: Omit<SchoolAssignment, 'id'>) => {
    const newAssignment = { ...assignment, id: new Date().toISOString() + Math.random() };
    setSchoolAssignments([...schoolAssignments, newAssignment]);
  };
  const updateSchoolAssignment = (updatedAssignment: SchoolAssignment) => {
    setSchoolAssignments(schoolAssignments.map(ass => ass.id === updatedAssignment.id ? updatedAssignment : ass));
  };
  const deleteSchoolAssignment = (id: string) => {
    setSchoolAssignments(schoolAssignments.filter(ass => ass.id !== id));
  };

  // Duties CRUD
  const addMeetingDuty = (duty: Omit<MeetingDuty, 'id'>) => {
    const newDuty = { ...duty, id: new Date().toISOString() + Math.random() };
    setMeetingDuties([...meetingDuties, newDuty]);
  };
  const updateMeetingDuty = (updatedDuty: MeetingDuty) => {
    setMeetingDuties(meetingDuties.map(duty => duty.id === updatedDuty.id ? updatedDuty : duty));
  };
  const deleteMeetingDuty = (id: string) => {
    setMeetingDuties(meetingDuties.filter(duty => duty.id !== id));
  };

  // Service Log CRUD
  const addOrUpdateServiceEntry = (entry: ServiceEntry) => {
    const existingIndex = serviceEntries.findIndex(e => e.id === entry.id);
    if (existingIndex > -1) {
      const newEntries = [...serviceEntries];
      newEntries[existingIndex] = entry;
      setServiceEntries(newEntries);
    } else {
      setServiceEntries([...serviceEntries, entry]);
    }
  };

  const deleteServiceEntry = (id: string) => {
    setServiceEntries(serviceEntries.filter(e => e.id !== id));
  };


  const renderContent = () => {
    switch (currentView) {
      case View.CALENDAR:
        return <CalendarView 
                  activities={ministryActivities}
                  onAddActivity={addMinistryActivity}
                  onUpdateActivity={updateMinistryActivity}
                  onDeleteActivity={deleteMinistryActivity}
               />;
      case View.SCHOOL:
        return <AssignmentList 
                  items={schoolAssignments}
                  type="school"
                  onAddItem={addSchoolAssignment}
                  onUpdateItem={updateSchoolAssignment}
                  onDeleteItem={deleteSchoolAssignment}
                />;
      case View.DUTIES:
        return <AssignmentList
                  items={meetingDuties}
                  type="duty"
                  onAddItem={addMeetingDuty}
                  onUpdateItem={updateMeetingDuty}
                  onDeleteItem={deleteMeetingDuty}
                />;
      case View.SERVICE_LOG:
        return <ServiceLogView
                  entries={serviceEntries}
                  onAddOrUpdateEntry={addOrUpdateServiceEntry}
                  onDeleteEntry={deleteServiceEntry}
                />
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-transparent font-sans flex items-center justify-center p-0 sm:p-4">
      <div className="max-w-md mx-auto h-full w-full bg-surface dark:bg-darkBackground shadow-2xl shadow-slate-400/30 dark:shadow-black/60 relative overflow-hidden flex flex-col sm:h-[95vh] sm:rounded-3xl">
        <Header 
          appTitle={appTitle}
          setAppTitle={setAppTitle}
          viewTitle={viewTitles[currentView]} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
        />
        <main className="flex-grow pt-24 pb-[88px] overflow-y-auto overscroll-contain">
           <div key={currentView}>
             {renderContent()}
           </div>
        </main>
        <BottomNav currentView={currentView} setView={setCurrentView} />
        <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
      </div>
    </div>
  );
};

export default App;