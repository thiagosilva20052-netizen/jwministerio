
import React, { useState, useEffect } from 'react';
import { View, MinistryActivity, SchoolAssignment, MeetingDuty, ServiceEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReminders } from './hooks/useReminders';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import AssignmentList from './components/AssignmentList';
import ServiceLogView from './components/ServiceLogView';
import SettingsView from './components/SettingsView';
import AssistantModal from './components/AssistantModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CALENDAR);
  const [ministryActivities, setMinistryActivities] = useLocalStorage<MinistryActivity[]>('ministryActivities', []);
  const [schoolAssignments, setSchoolAssignments] = useLocalStorage<SchoolAssignment[]>('schoolAssignments', []);
  const [meetingDuties, setMeetingDuties] = useLocalStorage<MeetingDuty[]>('meetingDuties', []);
  const [serviceEntries, setServiceEntries] = useLocalStorage<ServiceEntry[]>('serviceEntries', []);
  const [appTitle, setAppTitle] = useLocalStorage<string>('appTitle', 'Asistente del Ministerio');
  const [monthlyGoal, setMonthlyGoal] = useLocalStorage<number>('monthlyGoal', 50);

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
    [View.CALENDAR]: 'Calendario',
    [View.SCHOOL]: 'Vida y Ministerio',
    [View.DUTIES]: 'Deberes',
    [View.SERVICE_LOG]: 'Registro',
    [View.SETTINGS]: 'Configuración',
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

  // Data Management
  const handleExportData = () => {
      const data = {
          ministryActivities,
          schoolAssignments,
          meetingDuties,
          serviceEntries,
          appTitle,
          monthlyGoal,
          exportDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-ministerio-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const importedData = JSON.parse(event.target?.result as string);
              
              if (importedData.ministryActivities) setMinistryActivities(importedData.ministryActivities);
              if (importedData.schoolAssignments) setSchoolAssignments(importedData.schoolAssignments);
              if (importedData.meetingDuties) setMeetingDuties(importedData.meetingDuties);
              if (importedData.serviceEntries) setServiceEntries(importedData.serviceEntries);
              if (importedData.appTitle) setAppTitle(importedData.appTitle);
              if (importedData.monthlyGoal) setMonthlyGoal(importedData.monthlyGoal);
              
              setTimeout(() => {
                  window.location.reload();
              }, 500);

          } catch (error) {
              alert('Error al importar los datos. El archivo podría estar corrupto o tener un formato incorrecto.');
              console.error(error);
          }
      };
      reader.readAsText(file);
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
                  monthlyGoal={monthlyGoal}
                />;
      case View.SETTINGS:
          return <SettingsView 
                    monthlyGoal={monthlyGoal}
                    setMonthlyGoal={setMonthlyGoal}
                    onExportData={handleExportData}
                    onImportData={handleImportData}
                 />;
      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] w-screen font-sans flex items-center justify-center p-0 relative overflow-hidden bg-gray-50 dark:bg-black transition-colors duration-500">
      
      {/* Ambient Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/20 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-pink-400/20 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* 
          Main Container Logic:
          - bg-[#F2F2F7]/90: Use iOS system gray with high opacity for light mode. This contrasts with white cards.
          - bg-black/90: Use black with high opacity for dark mode. This contrasts with dark gray cards.
          - h-full: Takes full height of the 100dvh wrapper.
      */}
      <div className="max-w-[480px] mx-auto h-full w-full bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-3xl shadow-2xl relative overflow-hidden flex flex-col transition-all duration-300 sm:h-[92vh] sm:rounded-[2.5rem] sm:border sm:border-white/40 dark:sm:border-white/5">
        <Header 
          appTitle={appTitle}
          setAppTitle={setAppTitle}
          viewTitle={viewTitles[currentView]} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
        />
        <main className="flex-grow pt-24 pb-[env(safe-area-inset-bottom)] overflow-y-auto overscroll-contain scrollbar-hide">
           <div key={currentView} className="min-h-full pb-24">
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
