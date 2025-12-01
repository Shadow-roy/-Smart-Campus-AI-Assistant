
import React, { useState, useContext, useEffect } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { type View, type UserProfile } from '../types';
import { NotificationContext } from '../contexts/NotificationContext';
import { ThemeContext } from '../App';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
    activeView: View;
    userProfile: UserProfile;
}

const viewTitles: Record<View, string> = {
    dashboard: "Dashboard",
    timetable: "Weekly Timetable",
    assignments: "Assignments",
    studyBuddy: "Gemini Chat",
    profile: "Profile",
    grades: "Grade Tracker",
};

const Header: React.FC<HeaderProps> = ({ activeView, userProfile }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationContext = useContext(NotificationContext);
    const themeContext = useContext(ThemeContext);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting('Good Morning');
            else if (hour < 18) setGreeting('Good Afternoon');
            else setGreeting('Good Evening');
        };
        
        updateGreeting();
        const interval = setInterval(updateGreeting, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const title = activeView === 'dashboard'
      ? `${greeting}, ${userProfile.name.split(' ')[0]} 👋`
      : viewTitles[activeView];

    const toggleTheme = () => {
        themeContext?.setTheme(themeContext.theme === 'light' ? 'dark' : 'light');
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6 gap-4">
                <div className="min-w-0">
                    <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-onSurface dark:text-dark-onSurface truncate">
                        {title}
                    </h1>
                </div>
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    {/* Theme Toggle - Visible only on Mobile (md:hidden) */}
                    <button 
                        onClick={toggleTheme}
                        className="md:hidden p-3 bg-surface dark:bg-dark-surface rounded-full border border-outlineVariant/50 dark:border-dark-outlineVariant/50 hover:bg-surfaceVariant dark:hover:bg-dark-surfaceVariant transition-colors"
                        aria-label="Toggle theme"
                    >
                        {themeContext?.theme === 'light' ? (
                            <Sun size={20} className="text-amber-500"/> 
                        ) : (
                            <Moon size={20} className="text-primary dark:text-dark-primary"/>
                        )}
                    </button>

                    <button 
                        onClick={() => setShowNotifications(true)}
                        className="relative p-3 bg-surface dark:bg-dark-surface rounded-full border border-outlineVariant/50 dark:border-dark-outlineVariant/50 hover:bg-surfaceVariant dark:hover:bg-dark-surfaceVariant transition-colors"
                        aria-label={`View notifications. ${notificationContext?.unreadCount || 0} unread.`}
                    >
                        <Bell className="text-onSurfaceVariant dark:text-dark-onSurfaceVariant" size={20} />
                        {notificationContext && notificationContext.unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error/80 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-error text-onError text-[10px] items-center justify-center">
                                    {notificationContext.unreadCount}
                                </span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
            {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
        </>
    );
};

export default Header;
