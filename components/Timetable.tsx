
import React, { useContext, useRef, useState, useMemo } from 'react';
import { type Class, type ClassSchedule } from '../types';
import { UserContext } from '../App';
import { parseTimetableFromFile } from '../services/geminiService';
import { AlertTriangle, Loader2, UploadCloud, CalendarPlus, Plus, Edit2, Trash2, X, Save, Clock, MapPin, User, Calendar } from 'lucide-react';
import { ToastContext } from '../contexts/ToastContext';
import { parseTime } from '../utils/time';

// Modal for adding/editing a class
const ClassModal: React.FC<{
    day: string;
    classInfo: Partial<Class> | null;
    onClose: () => void;
    onSave: (day: string, classInfo: Class) => void;
    allDays: string[];
}> = ({ day: initialDay, classInfo, onClose, onSave, allDays }) => {
    const [formData, setFormData] = useState<Partial<Class>>(classInfo || {
        time: '', subject: '', code: '', lecturer: '', location: ''
    });
    const [selectedDay, setSelectedDay] = useState(initialDay || 'Monday');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (formData.time && formData.subject) {
            onSave(selectedDay, { ...formData, id: formData.id || Date.now() } as Class);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in-0" onClick={onClose}>
            <div className="relative bg-surface dark:bg-dark-surface rounded-3xl shadow-xl p-6 m-4 w-full max-w-md animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-onSurface dark:hover:text-dark-onSurface"><X size={24} /></button>
                <h2 className="text-xl font-bold mb-6 text-onSurface dark:text-dark-onSurface">{classInfo ? 'Edit Class' : 'Add New Class'}</h2>
                <div className="space-y-4">
                    {!classInfo && (
                        <div>
                            <label className="block text-xs font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Day</label>
                            <select name="day" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-onSurface dark:text-dark-onSurface">
                                {allDays.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Subject Name</label>
                        <input type="text" name="subject" value={formData.subject || ''} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-onSurface dark:text-dark-onSurface" placeholder="e.g. Computer Science" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Time (Start - End)</label>
                        <input type="text" name="time" value={formData.time || ''} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-onSurface dark:text-dark-onSurface" placeholder="e.g. 09:00 - 10:30" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Course Code</label>
                            <input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-onSurface dark:text-dark-onSurface" placeholder="e.g. CS101" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Location</label>
                            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-onSurface dark:text-dark-onSurface" placeholder="e.g. Room 302" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Lecturer</label>
                        <input type="text" name="lecturer" value={formData.lecturer || ''} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-onSurface dark:text-dark-onSurface" placeholder="e.g. Dr. Smith" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="flex items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-full shadow-md hover:bg-primary/90"><Save className="mr-2 h-4 w-4" /> Save</button>
                </div>
            </div>
        </div>
    );
};


const TimetableCard: React.FC<{ classInfo: Class, onEdit: () => void, onDelete: () => void, isLast: boolean }> = ({ classInfo, onEdit, onDelete, isLast }) => (
    <div className="relative pl-6 pb-6 group">
        {/* Timeline Line */}
        {!isLast && <div className="absolute left-[9px] top-4 bottom-0 w-0.5 bg-outlineVariant dark:bg-dark-outlineVariant"></div>}
        
        {/* Timeline Dot */}
        <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-surface dark:border-dark-surface bg-primary dark:bg-dark-primary z-10"></div>

        <div className="bg-surface dark:bg-dark-surface p-4 rounded-2xl border border-outlineVariant/50 dark:border-dark-outlineVariant/30 shadow-sm hover:shadow-md hover:border-primary/50 dark:hover:border-dark-primary/50 transition-all cursor-pointer relative overflow-hidden" onClick={onEdit}>
             {/* Edit/Delete Actions */}
             <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 bg-surfaceVariant dark:bg-dark-surfaceVariant rounded-lg hover:text-primary dark:hover:text-dark-primary"><Edit2 size={14}/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 bg-surfaceVariant dark:bg-dark-surfaceVariant rounded-lg hover:text-error dark:hover:text-dark-error"><Trash2 size={14}/></button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold font-mono text-primary dark:text-dark-primary bg-primaryContainer/50 dark:bg-dark-primaryContainer/20 px-2 py-1 rounded-md w-fit">
                    {classInfo.time}
                </span>
                <span className="text-xs font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 px-2 py-1 rounded-md w-fit">
                    {classInfo.code}
                </span>
            </div>
            
            <h3 className="text-lg font-bold text-onSurface dark:text-dark-onSurface mb-1">{classInfo.subject}</h3>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-2">
                <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{classInfo.lecturer}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{classInfo.location}</span>
                </div>
            </div>
        </div>
    </div>
);

const TimetableSkeleton: React.FC = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl h-64"></div>
        ))}
    </div>
);


const Timetable: React.FC = () => {
    const { timetableData, setTimetableData } = useContext(UserContext);
    const { addToast } = useContext(ToastContext)!;
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<{ day: string, classInfo: Partial<Class> | null }>({ day: 'Monday', classInfo: null });

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Ensure all days exist and classes are sorted by time
    const normalizedTimetable = useMemo(() => {
        const existingDays = new Set(timetableData.map(d => d.day));
        // Create missing days
        const missing = daysOfWeek.filter(d => !existingDays.has(d)).map(d => ({ day: d, classes: [] }));
        
        // Merge
        const merged = [...timetableData, ...missing];
        
        // Sort days
        merged.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

        // Sort classes within each day by start time
        return merged.map(daySchedule => {
            const sortedClasses = [...daySchedule.classes].sort((a, b) => {
                const [startA] = parseTime(a.time);
                const [startB] = parseTime(b.time);
                if (!startA) return 1;
                if (!startB) return -1;
                return startA.getTime() - startB.getTime();
            });
            return { ...daySchedule, classes: sortedClasses };
        });
    }, [timetableData]);


    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError(null);
        try {
            const newTimetable = await parseTimetableFromFile(file);
            if (newTimetable && newTimetable.length > 0) {
                // Merge logic instead of overwrite? For now overwrite is safer for consistency
                setTimetableData(newTimetable);
                addToast("Timetable uploaded successfully!", "success");
            } else {
                setError("AI could not find a valid schedule.");
            }
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
            console.error(e);
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleAddClass = () => {
        setEditingClass({ day: 'Monday', classInfo: null });
        setModalOpen(true);
    };

    const handleEditClass = (day: string, classInfo: Class) => {
        setEditingClass({ day, classInfo });
        setModalOpen(true);
    };

    const handleDeleteClass = (day: string, classId: number) => {
        if (window.confirm("Delete this class?")) {
            setTimetableData(prev => prev.map(d => {
                if (d.day === day) {
                    return { ...d, classes: d.classes.filter(c => (c.id || 0) !== classId) }; 
                }
                return d;
            }));
            addToast("Class deleted", "info");
        }
    };

    const handleSaveClass = (day: string, newClass: Class) => {
        setTimetableData(prev => {
            const existingDayIndex = prev.findIndex(d => d.day === day);
            let newData = [...prev];

            if (existingDayIndex >= 0) {
                const existingDay = newData[existingDayIndex];
                const existingClassIndex = newClass.id 
                    ? existingDay.classes.findIndex(c => c.id === newClass.id)
                    : -1;

                let updatedClasses;
                if (existingClassIndex >= 0) {
                    updatedClasses = [...existingDay.classes];
                    updatedClasses[existingClassIndex] = newClass;
                } else {
                    updatedClasses = [...existingDay.classes, newClass];
                }
                
                newData[existingDayIndex] = { ...existingDay, classes: updatedClasses };
            } else {
                newData.push({ day, classes: [newClass] });
            }
            return newData;
        });
        setModalOpen(false);
        addToast("Timetable updated", "success");
    };
    
    const handleClearAll = () => {
        if (window.confirm("Are you sure you want to clear the entire timetable? This cannot be undone.")) {
            setTimetableData([]);
            addToast("Timetable cleared", "info");
        }
    };

    const renderEmptyState = () => (
        <div className="text-center py-16 px-6 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl flex flex-col items-center border border-dashed border-outlineVariant dark:border-dark-outlineVariant">
            <CalendarPlus className="mx-auto h-16 w-16 text-primary/50 dark:text-dark-primary/50 mb-4" />
            <h2 className="text-2xl font-bold text-onSurface dark:text-dark-onSurface">Your Schedule is Empty</h2>
            <p className="mt-2 text-onSurfaceVariant dark:text-dark-onSurfaceVariant max-w-sm">
                Get started by uploading a screenshot of your timetable or manually adding your classes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
                 <button
                    onClick={triggerFileInput}
                    disabled={isUploading}
                    className="flex-1 flex items-center justify-center px-6 py-4 font-bold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    {isUploading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : <><UploadCloud className="mr-2 h-5 w-5" /> Upload File</>}
                </button>
                <button
                    onClick={handleAddClass}
                    className="flex-1 flex items-center justify-center px-6 py-4 font-bold text-primary bg-primaryContainer dark:text-dark-primary dark:bg-dark-primaryContainer rounded-xl hover:bg-primaryContainer/80 transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" /> Add Manually
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,application/pdf"
                disabled={isUploading}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 border-b border-outlineVariant/30 dark:border-dark-outlineVariant/30 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-onSurface dark:text-dark-onSurface flex items-center gap-2">
                        <Calendar className="text-primary dark:text-dark-primary" />
                        Weekly Schedule
                    </h2>
                    <p className="text-sm text-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-1">Manage your classes and lectures</p>
                </div>
                <div className="flex gap-2">
                     {timetableData.length > 0 && (
                        <>
                            <button onClick={triggerFileInput} className="p-3 text-onSurfaceVariant hover:text-primary dark:hover:text-dark-primary bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-xl transition-colors" title="Upload New">
                                <UploadCloud size={20} />
                            </button>
                            <button onClick={handleClearAll} className="p-3 text-onSurfaceVariant hover:text-error dark:hover:text-dark-error bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-xl transition-colors" title="Clear All">
                                <Trash2 size={20} />
                            </button>
                        </>
                    )}
                    <button onClick={handleAddClass} className="flex items-center px-5 py-3 text-sm font-bold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-xl shadow-md hover:bg-primary/90 transition-colors">
                        <Plus className="mr-2 h-5 w-5" /> Add Class
                    </button>
                </div>
            </div>
            
            {error && (
                 <div className="p-4 bg-errorContainer dark:bg-dark-errorContainer border-l-4 border-error dark:border-dark-error rounded-r-lg animate-in slide-in-from-top-2">
                    <div className="flex">
                        <div className="flex-shrink-0"><AlertTriangle className="h-5 w-5 text-error dark:text-dark-error" /></div>
                        <div className="ml-3"><p className="text-sm font-medium text-onErrorContainer dark:text-dark-onErrorContainer">{error}</p></div>
                    </div>
                </div>
            )}
            
            {isUploading ? <TimetableSkeleton /> : (timetableData.length === 0 ? renderEmptyState() : (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {normalizedTimetable.map((daySchedule) => (
                        <div key={daySchedule.day} className="flex flex-col h-full bg-surfaceVariant/20 dark:bg-dark-surfaceVariant/20 rounded-[2rem] border border-outlineVariant/30 dark:border-dark-outlineVariant/20 overflow-hidden">
                            <div className="p-5 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-b border-outlineVariant/30 dark:border-dark-outlineVariant/20 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-onSurface dark:text-dark-onSurface">{daySchedule.day}</h3>
                                <span className="text-xs font-bold px-2 py-1 rounded-md bg-surface dark:bg-dark-surface text-onSurfaceVariant dark:text-dark-onSurfaceVariant border border-outlineVariant/50">{daySchedule.classes.length} Classes</span>
                            </div>
                            
                            <div className="p-5 flex-1">
                                {daySchedule.classes.length > 0 ? (
                                    <div className="mt-2">
                                        {daySchedule.classes.map((classInfo, index) => (
                                            <TimetableCard 
                                                key={classInfo.id || index} 
                                                classInfo={classInfo} 
                                                onEdit={() => handleEditClass(daySchedule.day, classInfo)}
                                                onDelete={() => handleDeleteClass(daySchedule.day, classInfo.id || 0)}
                                                isLast={index === daySchedule.classes.length - 1}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
                                        <Clock size={40} className="mb-2 text-onSurfaceVariant dark:text-dark-onSurfaceVariant" />
                                        <p className="text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant">No classes scheduled</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Quick Add Button Footer */}
                            <button 
                                onClick={() => { setEditingClass({ day: daySchedule.day, classInfo: null }); setModalOpen(true); }}
                                className="w-full py-3 text-xs font-bold uppercase tracking-wider text-primary dark:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors border-t border-outlineVariant/30 dark:border-dark-outlineVariant/20"
                            >
                                + Add to {daySchedule.day}
                            </button>
                        </div>
                    ))}
                </div>
            ))}
            
            {modalOpen && (
                <ClassModal 
                    day={editingClass.day} 
                    classInfo={editingClass.classInfo} 
                    onClose={() => setModalOpen(false)} 
                    onSave={handleSaveClass} 
                    allDays={daysOfWeek}
                />
            )}
        </div>
    );
};

export default Timetable;
