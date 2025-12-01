
import React from 'react';
import { type View } from '../types';
import { BookOpen, Calendar, Home, Sparkles, User, GraduationCap } from 'lucide-react';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs font-medium transition-colors duration-200 group ${
      isActive
        ? 'text-primary dark:text-dark-primary'
        : 'text-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-onSurface dark:hover:text-dark-onSurface'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    <div className={`flex items-center justify-center h-8 w-16 rounded-full transition-colors ${isActive ? 'bg-primaryContainer dark:bg-dark-primaryContainer' : ''}`}>
        {icon}
    </div>
    <span className="mt-1 font-semibold">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Home', icon: <Home size={24} /> },
    { view: 'timetable', label: 'Timetable', icon: <Calendar size={24} /> },
    { view: 'assignments', label: 'Assign', icon: <BookOpen size={24} /> },
    { view: 'studyBuddy', label: 'AI Chat', icon: <Sparkles size={24} /> },
    { view: 'profile', label: 'Profile', icon: <User size={24} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-lg border-t border-outlineVariant/50 dark:border-dark-outlineVariant/50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavItem
            key={item.view}
            icon={item.icon}
            label={item.label}
            isActive={activeView === item.view}
            onClick={() => setView(item.view)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
