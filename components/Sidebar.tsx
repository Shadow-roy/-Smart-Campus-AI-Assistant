
import React, { useContext } from 'react';
import { type View } from '../types';
import { ThemeContext } from '../App';
import { BookOpen, Calendar, Home, Moon, Sun, User, GraduationCap, Zap, Sparkles } from 'lucide-react';

interface SidebarProps {
  activeView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li className="mb-2">
    <button
      onClick={onClick}
      className={`group relative flex items-center w-full px-5 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 ease-out ${
        isActive
          ? 'text-white bg-primary shadow-lg shadow-primary/30 dark:text-dark-onPrimary dark:bg-dark-primary dark:shadow-dark-primary/20 scale-100'
          : 'text-onSurfaceVariant hover:bg-surfaceVariant hover:text-onSurface dark:text-dark-onSurfaceVariant dark:hover:bg-dark-surfaceVariant dark:hover:text-dark-onSurface hover:scale-[1.02]'
      }`}
    >
      <div className={`relative z-10 flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10 ml-4 tracking-wide">{label}</span>
      
      {/* Active Indicator Dot */}
      {isActive && (
          <span className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white dark:bg-dark-onPrimary animate-pulse"></span>
      )}
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView }) => {
  const themeContext = useContext(ThemeContext);

  const toggleTheme = () => {
    if (themeContext) {
      themeContext.setTheme(themeContext.theme === 'light' ? 'dark' : 'light');
    }
  };

  const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: 'Overview', icon: <Home size={22} /> },
    { view: 'timetable', label: 'Schedule', icon: <Calendar size={22} /> },
    { view: 'assignments', label: 'Tasks', icon: <BookOpen size={22} /> },
    { view: 'grades', label: 'Performance', icon: <GraduationCap size={22} /> },
    { view: 'studyBuddy', label: 'AI Chat', icon: <Sparkles size={22} /> },
    { view: 'profile', label: 'Profile', icon: <User size={22} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[280px] m-4 mr-0 rounded-3xl bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl shadow-primary/5 dark:shadow-none h-[calc(100vh-2rem)] sticky top-4 overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>

      <div className="flex items-center mb-6 px-6 pt-8 relative z-10">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/30">
            <Zap size={24} fill="currentColor" />
        </div>
        <div className="ml-4">
            <h1 className="text-lg font-extrabold text-onSurface dark:text-dark-onSurface tracking-tight leading-none">Smart<br/><span className="text-primary dark:text-dark-primary">Campus</span></h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 overflow-y-auto no-scrollbar relative z-10">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.view}
              onClick={() => setView(item.view)}
            />
          ))}
        </ul>
      </nav>
      
      <div className="p-4 relative z-10">
        <div className="p-4 rounded-2xl bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border border-white/50 dark:border-white/5">
            <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full p-2 text-sm font-semibold rounded-xl bg-surface dark:bg-dark-surface hover:bg-white dark:hover:bg-dark-surfaceVariant text-onSurface dark:text-dark-onSurface transition-all duration-200 shadow-sm"
            >
            <div className="flex items-center">
                <div className={`p-1.5 rounded-lg mr-3 ${themeContext?.theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-transparent text-onSurfaceVariant'}`}>
                    <Sun size={18} />
                </div>
                <div className={`p-1.5 rounded-lg ${themeContext?.theme === 'dark' ? 'bg-primary/20 text-primary' : 'bg-transparent text-onSurfaceVariant'}`}>
                    <Moon size={18} />
                </div>
            </div>
            <span className="text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant font-medium">
                {themeContext?.theme === 'light' ? 'Light' : 'Dark'}
            </span>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
