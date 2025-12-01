
import type React from 'react';

export type Theme = 'light' | 'dark';
export type View = 'dashboard' | 'timetable' | 'assignments' | 'studyBuddy' | 'profile' | 'grades';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export interface ClassSchedule {
  day: string;
  classes: Class[];
}

export interface Class {
  id?: number; // Added optional ID for easier editing/deleting
  time: string;
  subject: string;
  code: string;
  lecturer: string;
  location: string;
}

export interface Assignment {
  id: number;
  title: string;
  subject: string;
  dueDate: string; // Stored as YYYY-MM-DD
  status: 'Pending' | 'Submitted' | 'Overdue';
  description: string;
  links?: string[];
}

export interface Reminder {
    id: number;
    text: string;
    isCompleted: boolean;
    snoozedUntil?: number;
    priority?: 'High' | 'Medium' | 'Low';
}

export interface UserProfile {
    name: string;
    rollNo: string;
    department: string;
    avatar: string;
    semester?: string;
    academicYear?: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface QuickLink {
    id: number;
    title: string;
    url: string;
}

export interface SubjectGrade {
    id: number;
    subjectName: string;
    credits: number;
    gradePoint: number;
}

export interface Semester {
    id: number;
    semesterNumber: number;
    subjects: SubjectGrade[];
}

export interface UserContextType {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  timetableData: ClassSchedule[];
  setTimetableData: React.Dispatch<React.SetStateAction<ClassSchedule[]>>;
  quickLinks: QuickLink[];
  setQuickLinks: React.Dispatch<React.SetStateAction<QuickLink[]>>;
  semesters: Semester[];
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'class' | 'assignment';
}

export interface NotificationContextType {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

export interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}
