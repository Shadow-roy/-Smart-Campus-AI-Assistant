
import React, { useContext, useEffect, useState, useMemo } from 'react';
import { type Class, type Reminder, type QuickLink, type View } from '../types';
import { Book, Check, CheckCircle2, Clock, Plus, Trash2, Edit2, ClipboardList, XCircle, AlarmClock, Link, ExternalLink, Calendar, ArrowRight, Zap, Target } from 'lucide-react';
import { UserContext } from '../App';
import { parseTime, formatDueDate } from '../utils/time';

const Card: React.FC<{ title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string, action?: React.ReactNode }> = ({ title, icon, children, className, action }) => (
    <div className={`p-6 bg-surface dark:bg-dark-surface rounded-[2rem] border border-outlineVariant/40 dark:border-dark-outlineVariant/30 shadow-sm ${className}`}>
        {title && (
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    {icon && <div className="p-2.5 rounded-xl bg-primaryContainer dark:bg-dark-primaryContainer text-primary dark:text-dark-primary mr-4">{icon}</div>}
                    <h3 className="text-xl font-bold text-onSurface dark:text-dark-onSurface tracking-tight">{title}</h3>
                </div>
                {action}
            </div>
        )}
        <div className="relative">{children}</div>
    </div>
);

const ClassInfo: React.FC<{ classInfo: Class, type: 'current' | 'next' }> = ({ classInfo, type }) => (
    <div className={`relative p-6 rounded-3xl overflow-hidden transition-all duration-300 group ${
        type === 'current' 
        ? 'bg-gradient-to-br from-primary to-violet-600 dark:from-dark-primary dark:to-violet-900 text-white shadow-lg shadow-primary/20' 
        : 'bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border border-transparent hover:border-primary/20'
    }`}>
        {/* Abstract shapes for current class */}
        {type === 'current' && (
            <>
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 rounded-full bg-white/10 blur-xl"></div>
            </>
        )}
        
        <div className="relative z-10 flex items-start justify-between mb-4">
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                type === 'current' 
                ? 'bg-white/20 text-white backdrop-blur-md' 
                : 'bg-primaryContainer text-primary dark:bg-dark-primaryContainer dark:text-dark-primary'
            }`}>
                {type === 'current' ? 'Happening Now' : 'Up Next'}
            </span>
            <span className={`font-mono text-sm font-semibold ${type === 'current' ? 'text-white/90' : 'text-onSurfaceVariant dark:text-dark-onSurfaceVariant'}`}>
                {classInfo.time}
            </span>
        </div>
        
        <div className="relative z-10">
            <p className={`text-2xl font-extrabold mb-2 leading-tight ${type === 'current' ? 'text-white' : 'text-onSurface dark:text-dark-onSurface'}`}>
                {classInfo.subject}
            </p>
            <div className={`flex items-center text-sm font-medium gap-3 ${type === 'current' ? 'text-white/80' : 'text-onSurfaceVariant dark:text-dark-onSurfaceVariant'}`}>
                 <span className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${type === 'current' ? 'bg-white' : 'bg-primary'}`}></div> 
                    {classInfo.location}
                 </span>
                 <span className="opacity-40">|</span>
                 <span>{classInfo.lecturer}</span>
            </div>
        </div>
    </div>
);


const Dashboard: React.FC<{ setView: (view: View) => void }> = ({ setView }) => {
    const userContext = useContext(UserContext);
    const [now, setNow] = useState(new Date());

    // Reminder states
    const [newReminder, setNewReminder] = useState('');
    const [newReminderPriority, setNewReminderPriority] = useState<Reminder['priority']>('Medium');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [snoozingId, setSnoozingId] = useState<number | null>(null);

    // Quick Link states
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [showAddLink, setShowAddLink] = useState(false);
    
    useEffect(() => {
        const timerId = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timerId);
    }, []);

    if (!userContext) return null;
    const { reminders, setReminders, assignments, timetableData, quickLinks, setQuickLinks, userProfile } = userContext;

    const dueAssignments = assignments.filter(a => a.status === 'Pending' || a.status === 'Overdue').slice(0, 3);
    const completedTasks = reminders.filter(r => r.isCompleted).length;
    const pendingTasks = reminders.length - completedTasks;

    const handleAddReminder = () => {
        if (newReminder.trim()) {
            setReminders(prev => [{ id: Date.now(), text: newReminder.trim(), isCompleted: false, priority: newReminderPriority }, ...prev]);
            setNewReminder('');
            setNewReminderPriority('Medium');
        }
    };
    const handleToggleReminder = (id: number) => setReminders(reminders.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r));
    const handleDeleteReminder = (id: number) => setReminders(reminders.filter(r => r.id !== id));
    const handleStartEdit = (reminder: Reminder) => { setEditingId(reminder.id); setEditText(reminder.text); };
    const handleSaveEdit = (id: number) => { if (editText.trim()) setReminders(reminders.map(r => r.id === id ? { ...r, text: editText.trim() } : r)); setEditingId(null); };
    const handleSnooze = (id: number, mins: number) => { setReminders(prev => prev.map(r => (r.id === id ? { ...r, snoozedUntil: Date.now() + mins * 60000, isCompleted: false } : r))); setSnoozingId(null); };
    const handleAddLink = () => { 
        if (newLinkTitle.trim() && newLinkUrl.trim()) { 
            let url = newLinkUrl.trim();
            if (!url.startsWith('http')) url = 'https://' + url;
            setQuickLinks(prev => [...prev, { id: Date.now(), title: newLinkTitle.trim(), url }]); 
            setNewLinkTitle(''); setNewLinkUrl(''); setShowAddLink(false); 
        } 
    };
    const handleDeleteLink = (id: number) => setQuickLinks(prev => prev.filter(link => link.id !== id));

    const priorityOrder: Record<Reminder['priority'] & string, number> = { High: 3, Medium: 2, Low: 1 };
    const activeReminders = useMemo(() => reminders.filter(r => !r.snoozedUntil || r.snoozedUntil <= now.getTime()), [reminders, now]);
    const sortedReminders = useMemo(() => [...activeReminders].sort((a, b) => (a.isCompleted === b.isCompleted ? (priorityOrder[b.priority || 'Low'] - priorityOrder[a.priority || 'Low']) : Number(a.isCompleted) - Number(b.isCompleted))), [activeReminders]);

    const todayStr = now.toLocaleDateString('en-US', { weekday: 'long' });
    const todaysClasses = timetableData.find(day => day.day === todayStr)?.classes || [];
    let currentClass: Class | null = null;
    let nextClass: Class | null = null;

    if (todaysClasses.length > 0) {
        const sorted = [...todaysClasses].sort((a, b) => { const [as] = parseTime(a.time); const [bs] = parseTime(b.time); return (as?.getTime() || 0) - (bs?.getTime() || 0); });
        for (const c of sorted) {
            const [start, end] = parseTime(c.time);
            if (start && end) {
                if (now >= start && now <= end) currentClass = c;
                else if (now < start && !nextClass) nextClass = c;
            }
        }
    }

    const priorityColors: Record<string, string> = { High: 'bg-error', Medium: 'bg-amber-500', Low: 'bg-tertiary' };

    // Safe name display
    const displayName = userProfile?.name ? userProfile.name.split(' ')[0] : 'Guest';

    // Dynamic greeting calculation
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="space-y-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-surface dark:bg-dark-surface p-8 sm:p-10 shadow-xl shadow-primary/5 dark:shadow-none border border-outlineVariant/30 dark:border-dark-outlineVariant/20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-tertiary/20 to-transparent rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-onSurfaceVariant dark:text-dark-onSurfaceVariant text-lg font-medium mb-1">
                            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-onSurface dark:text-dark-onSurface tracking-tight">
                            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{displayName}</span>
                        </h1>
                        <p className="mt-3 text-onSurfaceVariant dark:text-dark-onSurfaceVariant max-w-md">
                            You have <span className="font-bold text-onSurface dark:text-dark-onSurface">{todaysClasses.length} classes</span> and <span className="font-bold text-onSurface dark:text-dark-onSurface">{dueAssignments.length} assignments</span> pending. Let's conquer the day!
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 text-center min-w-[100px]">
                            <p className="text-3xl font-bold text-primary dark:text-dark-primary">{pendingTasks}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-onSurfaceVariant dark:text-dark-onSurfaceVariant">Tasks</p>
                        </div>
                         <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/50 dark:border-white/10 text-center min-w-[100px]">
                            <p className="text-3xl font-bold text-secondary dark:text-dark-secondary">{completedTasks}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-onSurfaceVariant dark:text-dark-onSurfaceVariant">Done</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Schedule */}
                    <Card title="Today's Pulse" icon={<Clock size={22} />} action={
                        <button onClick={() => setView('timetable')} className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline">View Full Schedule</button>
                    }>
                        <div className="space-y-4">
                            {todaysClasses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 bg-surfaceVariant/30 dark:bg-dark-surfaceVariant/30 rounded-3xl border border-dashed border-outlineVariant dark:border-dark-outlineVariant">
                                    <div className="p-4 rounded-full bg-surfaceVariant dark:bg-dark-surfaceVariant mb-4">
                                        <Zap size={32} className="text-onSurfaceVariant dark:text-dark-onSurfaceVariant opacity-50" />
                                    </div>
                                    <p className="text-lg font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant">No classes today</p>
                                    <p className="text-sm text-onSurfaceVariant/70 dark:text-dark-onSurfaceVariant/70">Enjoy your free time!</p>
                                </div>
                            ) : (
                                <>
                                    {currentClass && <ClassInfo classInfo={currentClass} type="current" />}
                                    {nextClass && <ClassInfo classInfo={nextClass} type="next" />}
                                    {!currentClass && !nextClass && (
                                         <div className="text-center py-10 bg-surfaceVariant/30 dark:bg-dark-surfaceVariant/30 rounded-3xl">
                                            <p className="font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant">All classes completed!</p>
                                         </div>
                                    )}
                                </>
                            )}
                        </div>
                    </Card>

                    {/* Quick Links */}
                    <Card title="Quick Access" icon={<Link size={22} />}>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {quickLinks.map(link => (
                                <div key={link.id} className="group relative flex flex-col items-center justify-center p-4 bg-surfaceVariant/30 dark:bg-dark-surfaceVariant/30 border border-transparent hover:border-primary/30 hover:bg-primaryContainer/20 dark:hover:bg-dark-primaryContainer/10 rounded-2xl transition-all duration-300">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center w-full">
                                        <div className="w-10 h-10 rounded-xl bg-surface dark:bg-dark-surface shadow-sm flex items-center justify-center mb-3 text-tertiary dark:text-dark-tertiary group-hover:scale-110 transition-transform">
                                            <ExternalLink size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-onSurface dark:text-dark-onSurface truncate w-full">{link.title}</span>
                                    </a>
                                    <button onClick={() => handleDeleteLink(link.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-onSurfaceVariant hover:bg-errorContainer hover:text-error transition-all">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                             <button onClick={() => setShowAddLink(true)} className="flex flex-col items-center justify-center p-4 border border-dashed border-outlineVariant dark:border-dark-outlineVariant rounded-2xl hover:border-primary hover:bg-primaryContainer/10 dark:hover:bg-dark-primaryContainer/10 transition-all text-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-primary dark:hover:text-dark-primary">
                                <Plus size={24} className="mb-2 opacity-50" />
                                <span className="text-xs font-bold">Add Link</span>
                            </button>
                        </div>
                        {showAddLink && (
                            <div className="mt-6 p-5 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-2xl animate-in fade-in-0 zoom-in-95">
                                <div className="space-y-3">
                                    <input type="text" placeholder="Title (e.g., Portal)" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} className="w-full text-sm p-3 bg-surface dark:bg-dark-surface border-none rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary placeholder-onSurfaceVariant/50"/>
                                    <input type="text" placeholder="URL (https://...)" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} className="w-full text-sm p-3 bg-surface dark:bg-dark-surface border-none rounded-xl focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary placeholder-onSurfaceVariant/50"/>
                                    <div className="flex justify-end space-x-2 pt-2">
                                        <button onClick={() => setShowAddLink(false)} className="px-4 py-2 text-xs font-bold text-onSurfaceVariant hover:bg-surfaceVariant rounded-lg transition-colors">Cancel</button>
                                        <button onClick={handleAddLink} className="px-4 py-2 text-xs font-bold text-white bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-lg shadow-lg shadow-primary/30">Save</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    {/* Due Assignments */}
                    <Card title="Due Soon" icon={<Book size={22} />} action={
                        <button onClick={() => setView('assignments')} className="p-2 rounded-full hover:bg-surfaceVariant dark:hover:bg-dark-surfaceVariant transition-colors"><ArrowRight size={18} className="text-onSurfaceVariant" /></button>
                    }>
                         <div className="space-y-4">
                            {dueAssignments.length > 0 ? dueAssignments.map((a, index) => (
                                <div key={index} onClick={() => setView('assignments')} className="group p-4 rounded-2xl bg-surfaceVariant/30 dark:bg-dark-surfaceVariant/30 border border-transparent hover:border-secondary/30 hover:bg-surfaceVariant/50 dark:hover:bg-dark-surfaceVariant/50 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${a.status === 'Overdue' ? 'bg-error/10 text-error' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>{a.status}</span>
                                        <span className={`text-xs font-medium flex items-center gap-1 ${a.status === 'Overdue' ? 'text-error' : 'text-onSurfaceVariant'}`}><Clock size={10} /> {formatDueDate(a.dueDate)}</span>
                                    </div>
                                    <h4 className="font-bold text-onSurface dark:text-dark-onSurface line-clamp-1 group-hover:text-secondary dark:group-hover:text-dark-secondary transition-colors">{a.title}</h4>
                                    <p className="text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-0.5">{a.subject}</p>
                                </div>
                            )) : (
                                <div className="text-center py-8 bg-surfaceVariant/20 dark:bg-dark-surfaceVariant/20 rounded-2xl">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-2">
                                        <Check size={20}/>
                                    </div>
                                    <p className="text-sm font-bold text-onSurface dark:text-dark-onSurface">All caught up!</p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Todo List */}
                    <Card title="To-Do" icon={<Target size={22} />} className="flex-1">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 p-1 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-2xl border border-transparent focus-within:border-primary/50 focus-within:bg-surface dark:focus-within:bg-dark-surface transition-all">
                                <select value={newReminderPriority} onChange={e => setNewReminderPriority(e.target.value as Reminder['priority'])} className="h-10 pl-3 pr-2 text-xs font-bold bg-transparent border-none focus:ring-0 text-onSurfaceVariant cursor-pointer">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Med</option>
                                    <option value="High">High</option>
                                </select>
                                <input type="text" value={newReminder} onChange={(e) => setNewReminder(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddReminder()} placeholder="New task..." className="flex-1 h-10 bg-transparent border-none focus:ring-0 text-sm text-onSurface dark:text-dark-onSurface placeholder-onSurfaceVariant/50"/>
                                <button onClick={handleAddReminder} className="p-2.5 bg-primary text-white dark:bg-dark-primary dark:text-dark-onPrimary rounded-xl shadow-md hover:scale-105 active:scale-95 transition-transform">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                            {sortedReminders.length > 0 ? sortedReminders.map((r) => (
                                 <div key={r.id} className={`group flex items-center p-3 rounded-xl transition-all ${r.isCompleted ? 'opacity-50' : 'bg-surfaceVariant/20 dark:bg-dark-surfaceVariant/20 hover:bg-surfaceVariant/40'}`}>
                                    <button onClick={() => handleToggleReminder(r.id)} className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${r.isCompleted ? 'bg-primary border-primary dark:bg-dark-primary dark:border-dark-primary' : 'border-outlineVariant hover:border-primary'}`}>
                                        {r.isCompleted && <Check size={10} className="text-white" />}
                                    </button>

                                    {editingId === r.id ? (
                                        <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onBlur={() => handleSaveEdit(r.id)} onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(r.id)} className="flex-1 text-sm bg-transparent border-b border-primary focus:outline-none text-onSurface dark:text-dark-onSurface" autoFocus />
                                    ) : (
                                        <div className="flex-1 min-w-0">
                                            <p onClick={() => handleToggleReminder(r.id)} className={`text-sm font-medium truncate cursor-pointer ${r.isCompleted ? 'line-through text-onSurfaceVariant' : 'text-onSurface dark:text-dark-onSurface'}`}>{r.text}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                 <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[r.priority]}`}></span>
                                                 {r.snoozedUntil && <span className="text-[10px] text-amber-500 flex items-center gap-0.5"><AlarmClock size={8}/> Snoozed</span>}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setSnoozingId(snoozingId === r.id ? null : r.id)} className="p-1.5 text-onSurfaceVariant hover:text-amber-500"><AlarmClock size={14} /></button>
                                        <button onClick={() => handleStartEdit(r)} className="p-1.5 text-onSurfaceVariant hover:text-primary"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDeleteReminder(r.id)} className="p-1.5 text-onSurfaceVariant hover:text-error"><Trash2 size={14} /></button>
                                    </div>
                                     {snoozingId === r.id && (
                                        <div className="absolute right-0 mt-8 w-32 bg-surface dark:bg-dark-surface rounded-xl shadow-xl border border-outlineVariant z-20 overflow-hidden animate-in zoom-in-95">
                                            {[15, 60, 1440].map(m => (
                                                <button key={m} onClick={() => handleSnooze(r.id, m)} className="w-full text-left text-xs px-3 py-2 hover:bg-surfaceVariant dark:hover:bg-dark-surfaceVariant">
                                                    {m === 1440 ? 'Tomorrow' : `${m} mins`}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                 </div>
                            )) : (
                                <div className="text-center py-8 text-onSurfaceVariant/60 dark:text-dark-onSurfaceVariant/60">
                                    <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No tasks yet.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
