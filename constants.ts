
import { type ClassSchedule, type Assignment, type Reminder, type UserProfile } from './types';

const getDateFromNow = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

// Default data is empty to ensure privacy for new users
export const TIMETABLE_DATA: ClassSchedule[] = [];

export const ASSIGNMENTS_DATA: Assignment[] = [];

export const REMINDERS_DATA: Reminder[] = [
    { id: 1, text: "Welcome! This is your personal to-do list.", isCompleted: false, priority: 'Low' }
];

export const USER_PROFILE: UserProfile = {
    name: "Guest User",
    rollNo: "---",
    department: "General",
    avatar: "",
    semester: "Not Set",
    academicYear: "2024-2025"
};
