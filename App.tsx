
import React, { useState, createContext, useMemo, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
const Dashboard = lazy(() => import('./components/Dashboard'));
const Timetable = lazy(() => import('./components/Timetable'));
const Assignments = lazy(() => import('./components/Assignments'));
const StudyBuddy = lazy(() => import('./components/StudyBuddy'));
const Profile = lazy(() => import('./components/Profile'));
const Grades = lazy(() => import('./components/Grades'));
import { type Theme, type View, type ClassSchedule, type UserProfile, type Reminder, type Assignment, type UserContextType, type ThemeContextType, type QuickLink, type Semester, type ChatMessage } from './types';
import { USER_PROFILE, REMINDERS_DATA, ASSIGNMENTS_DATA } from './constants';
import BottomNav from './components/BottomNav';
import { NotificationProvider } from './contexts/NotificationContext';
import { useNotificationScheduler } from './hooks/useNotifications';
import Header from './components/Header';
import { ToastProvider } from './contexts/ToastContext';


export const ThemeContext = createContext<ThemeContextType | null>(null);

export const UserContext = createContext<UserContextType>({
  userProfile: USER_PROFILE,
  setUserProfile: () => {},
  reminders: [],
  setReminders: () => {},
  assignments: [],
  setAssignments: () => {},
  timetableData: [],
  setTimetableData: () => {},
  quickLinks: [],
  setQuickLinks: () => {},
  semesters: [],
  setSemesters: () => {},
  chatHistory: [],
  setChatHistory: () => {},
});

const NotificationScheduler: React.FC = () => {
    useNotificationScheduler();
    return null;
};


const App: React.FC = () => {
  // Unified state management with lazy initialization from localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
       const savedTheme = localStorage.getItem('theme');
       if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
       if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  const [view, setView] = useState<View>('dashboard');

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : USER_PROFILE;
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('reminders');
    return saved ? JSON.parse(saved) : REMINDERS_DATA;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('assignments');
    return saved ? JSON.parse(saved) : ASSIGNMENTS_DATA;
  });

  const [timetableData, setTimetableData] = useState<ClassSchedule[]>(() => {
    const saved = localStorage.getItem('timetableData');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(() => {
    const saved = localStorage.getItem('quickLinks');
    return saved ? JSON.parse(saved) : [];
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const saved = localStorage.getItem('semesters');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [{ sender: 'ai', text: "Hello! I'm your Study Buddy. How can I help you with your coursework today?" }];
  });

  // Effect to apply dark mode and save preference
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effects to save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
  }, [reminders]);
  
  useEffect(() => {
    localStorage.setItem('assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('timetableData', JSON.stringify(timetableData));
  }, [timetableData]);
  
  useEffect(() => {
    localStorage.setItem('quickLinks', JSON.stringify(quickLinks));
  }, [quickLinks]);

  useEffect(() => {
    localStorage.setItem('semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Effect to clear timetable at the end of the week
  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Saturday = 6
    if (dayOfWeek === 6 || dayOfWeek === 0) {
      const lastCleared = localStorage.getItem('timetableClearedWeek');
      const currentWeek = getWeekNumber(today);
      if (lastCleared !== currentWeek.toString()) {
        setTimetableData([]);
        localStorage.setItem('timetableClearedWeek', currentWeek.toString());
      }
    }
  }, []);

  const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return weekNo;
  }

  const themeContextValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const userContextValue = useMemo(() => ({ 
      userProfile, setUserProfile, 
      reminders, setReminders, 
      assignments, setAssignments, 
      timetableData, setTimetableData, 
      quickLinks, setQuickLinks, 
      semesters, setSemesters,
      chatHistory, setChatHistory
  }), [userProfile, reminders, assignments, timetableData, quickLinks, semesters, chatHistory]);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard setView={setView} />;
      case 'timetable':
        return <Timetable />;
      case 'assignments':
        return <Assignments />;
      case 'studyBuddy':
        return <StudyBuddy />;
      case 'profile':
        return <Profile />;
      case 'grades':
        return <Grades />;
      default:
        return <Dashboard setView={setView} />;
    }
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
        <UserContext.Provider value={userContextValue}>
          <ToastProvider>
            <NotificationProvider>
              <NotificationScheduler />
              <div className="flex h-screen text-on-background dark:text-dark-on-background font-sans">
                <Sidebar activeView={view} setView={setView} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20 md:pb-6 lg:pb-8 bg-background dark:bg-dark-background">
                  <Header activeView={view} userProfile={userProfile} />
                  <Suspense fallback={<div>Loading...</div>}>
                    {renderView()}
                  </Suspense>
                </main>
                <BottomNav activeView={view} setView={setView} />
              </div>
            </NotificationProvider>
          </ToastProvider>
        </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
