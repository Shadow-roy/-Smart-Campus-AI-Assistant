

import React, { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import { Bell, Clock, Book, X } from 'lucide-react';

const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(months / 12);
    return `${years}y ago`;
}

interface NotificationCenterProps {
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
    const context = useContext(NotificationContext);

    if (!context) return null;
    const { notifications, unreadCount, markAllAsRead } = context;

    const NotificationIcon = ({ type }: { type: 'class' | 'assignment' }) => {
        if (type === 'class') {
            return <Clock className="w-5 h-5 text-primary dark:text-dark-primary" />;
        }
        return <Book className="w-5 h-5 text-amber-500" />;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/30 z-40 animate-in fade-in-0" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-4 top-20 w-full max-w-sm bg-surface dark:bg-dark-surface rounded-3xl shadow-2xl border border-outlineVariant/50 dark:border-dark-outlineVariant/50 transform transition-all animate-in slide-in-from-top-4 fade-in-0"
            >
                <div className="flex justify-between items-center p-4 border-b border-outlineVariant/50 dark:border-dark-outlineVariant/50">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    <div className="flex items-center gap-4">
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs font-medium text-primary dark:text-dark-primary hover:underline">
                                Mark all as read
                            </button>
                        )}
                        <button onClick={onClose} className="text-onSurfaceVariant/80 hover:text-onSurfaceVariant dark:hover:text-dark-onSurfaceVariant" aria-label="Close notifications">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <Bell size={32} className="mx-auto text-onSurfaceVariant/50 dark:text-dark-onSurfaceVariant/50" />
                            <p className="mt-4 font-semibold">No notifications yet</p>
                            <p className="text-sm text-onSurfaceVariant dark:text-dark-onSurfaceVariant">We'll let you know when something comes up.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-outlineVariant/50 dark:divide-dark-outlineVariant/50">
                            {notifications.map(n => (
                                <li key={n.id} className={`p-4 flex gap-4 transition-colors ${!n.read ? 'bg-primaryContainer/50 dark:bg-dark-primaryContainer/20' : ''}`}>
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surfaceVariant dark:bg-dark-surfaceVariant flex items-center justify-center">
                                        <NotificationIcon type={n.type} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{n.title}</p>
                                        <p className="text-sm text-onSurfaceVariant dark:text-dark-onSurfaceVariant">{n.message}</p>
                                        <p className="text-xs text-onSurfaceVariant/80 dark:text-dark-onSurfaceVariant/80 mt-1">{formatTimestamp(n.timestamp)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;