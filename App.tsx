
import React, { useState, useEffect } from 'react';
import { View, MinistryActivity, SchoolAssignment, MeetingDuty, ServiceEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useReminders } from './hooks/useReminders';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import CalendarView from './components/CalendarView';
import MeetingsView from './components/AssignmentList'; // Re-using file but with new Component
import ServiceLogView from './components/ServiceLogView';
import SettingsView from './components/SettingsView';
import AssistantModal from './components/AssistantModal';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.CALENDAR);
  const [ministryActivities, setMinistryActivities] = useLocalStorage<MinistryActivity[]>('ministryActivities', []);
  const [schoolAssignments, setSchoolAssignments] = useLocalStorage<SchoolAssignment[]>('schoolAssignments', []);
  const [meetingDuties, setMeetingDuties] = useLocalStorage<MeetingDuty[]>('meetingDuties', []);
  const [serviceEntries, setServiceEntries] = useLocalStorage<ServiceEntry[]>('serviceEntries', []);
  const [appTitle, setAppTitle] = useLocalStorage<string>('appTitle', 'Asistente');
  const [monthlyGoal, setMonthlyGoal] = useLocalStorage<number>('monthlyGoal', 50);

  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('isDarkMode', true); // Default to true for Pro theme
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
    [View.MEETINGS]: 'Reuniones',
    [View.SERVICE_LOG]: 'Registro',
    [View.SETTINGS]: 'Ajustes',
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
      case View.MEETINGS:
        return <MeetingsView 
                  schoolAssignments={schoolAssignments}
                  meetingDuties={meetingDuties}
                  onAddSchool={addSchoolAssignment}
                  onUpdateSchool={updateSchoolAssignment}
                  onDeleteSchool={deleteSchoolAssignment}
                  onAddDuty={addMeetingDuty}
                  onUpdateDuty={updateMeetingDuty}
                  onDeleteDuty={deleteMeetingDuty}
                  onOpenAssistant={() => setIsAssistantOpen(true)}
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
    <div className="h-[100dvh] w-full font-sans text-white flex flex-col bg-[#020617] transition-colors duration-500 overflow-hidden">
      
      {/* Pro Background: Gradient Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[80%] h-[60%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-purple-600/15 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow pointer-events-none z-0"></div>
      
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 relative z-20">
        <Header 
          appTitle={appTitle}
          setAppTitle={setAppTitle}
          viewTitle={viewTitles[currentView]} 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
        />
      </div>
      
      {/* Content Scroll Area - Flex grow to fill space */}
      <main className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide pb-[100px] relative z-10 w-full max-w-[600px] mx-auto">
           {renderContent()}
      </main>
      
      {/* Bottom Navigation - Fixed at bottom */}
      <BottomNav currentView={currentView} setView={setCurrentView} />
      
      <AssistantModal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export default App;
