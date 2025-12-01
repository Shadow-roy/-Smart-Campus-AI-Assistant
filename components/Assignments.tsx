
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { summarizeText } from '../services/geminiService';
import { type Assignment } from '../types';
import { Loader2, Wand2, X, ChevronDown, Save, Trash2, PlusCircle, Link, Plus, Trash, ArrowUpDown, CheckCircle2, FileText } from 'lucide-react';
import { UserContext } from '../App';
import { formatDueDate } from '../utils/time';

const AssignmentModal: React.FC<{
    assignment: Assignment;
    onClose: () => void;
    onSave: (assignment: Assignment) => void;
    onDelete: (id: number) => void;
    isNew: boolean;
}> = ({ assignment, onClose, onSave, onDelete, isNew }) => {
    const [editableAssignment, setEditableAssignment] = useState<Assignment>(assignment);
    const [newLink, setNewLink] = useState('');

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    useEffect(() => {
        setEditableAssignment(assignment);
    }, [assignment]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditableAssignment(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLink = () => {
        if (newLink.trim()) {
            let url = newLink.trim();
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            const updatedLinks = [...(editableAssignment.links || []), url];
            setEditableAssignment(prev => ({ ...prev, links: updatedLinks }));
            setNewLink('');
        }
    };

    const handleDeleteLink = (index: number) => {
        const updatedLinks = editableAssignment.links?.filter((_, i) => i !== index);
        setEditableAssignment(prev => ({ ...prev, links: updatedLinks }));
    };


    const handleSave = () => {
        onSave(editableAssignment);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            onDelete(assignment.id);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity animate-in fade-in-0"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="relative bg-surface dark:bg-dark-surface rounded-3xl shadow-xl p-6 m-4 w-full max-w-lg transform transition-all animate-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-onSurfaceVariant/80 hover:text-onSurfaceVariant dark:hover:text-dark-onSurfaceVariant transition-colors"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold text-onSurface dark:text-dark-onSurface mb-6">
                    {isNew ? 'Create New Assignment' : 'Edit Assignment'}
                </h2>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Title</label>
                        <input type="text" name="title" id="title" value={editableAssignment.title} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Subject</label>
                        <input type="text" name="subject" id="subject" value={editableAssignment.subject} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Due Date</label>
                        <input type="date" name="dueDate" id="dueDate" value={editableAssignment.dueDate} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Status</label>
                        <select name="status" id="status" value={editableAssignment.status} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary">
                            <option value="Pending">Pending</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Description</label>
                        <textarea name="description" id="description" value={editableAssignment.description} onChange={handleChange} rows={4} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg resize-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Relevant Links</label>
                         <div className="space-y-2">
                             {editableAssignment.links?.map((link, index) => (
                                 <div key={index} className="flex items-center justify-between text-sm p-2 bg-surfaceVariant dark:bg-dark-surfaceVariant rounded-lg">
                                     <a href={link} target="_blank" rel="noopener noreferrer" className="truncate text-primary dark:text-dark-primary hover:underline">{link}</a>
                                     <button onClick={() => handleDeleteLink(index)} className="ml-2 p-1 text-onSurfaceVariant hover:text-error dark:hover:text-dark-error"><Trash size={14}/></button>
                                 </div>
                             ))}
                             <div className="flex space-x-2">
                                 <input type="text" placeholder="Add a URL" value={newLink} onChange={e => setNewLink(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddLink()} className="flex-grow p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                                 <button onClick={handleAddLink} className="p-2 text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-lg hover:bg-primary/90"><Plus size={16}/></button>
                             </div>
                         </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-error bg-errorContainer rounded-full hover:bg-errorContainer/80 dark:text-dark-error dark:bg-dark-errorContainer dark:hover:bg-dark-errorContainer/80 transition-colors"
                        aria-label="Delete assignment"
                        hidden={isNew}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-full shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
                        aria-label="Save changes"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const AssignmentCard: React.FC<{
    assignment: Assignment;
    onStatusChange: (newStatus: Assignment['status']) => void;
    onCardClick: () => void;
}> = ({ assignment, onStatusChange, onCardClick }) => {
    const statusColor = {
        Pending: 'border-l-amber-500',
        Submitted: 'border-l-green-500',
        Overdue: 'border-l-error dark:border-l-dark-error',
    };

    const selectStatusColor = {
        Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
        Submitted: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
        Overdue: 'bg-errorContainer text-onErrorContainer dark:bg-dark-errorContainer dark:text-dark-onErrorContainer'
    };
    
    const selectStatusIconColor = {
        Pending: 'text-amber-700 dark:text-amber-300',
        Submitted: 'text-green-700 dark:text-green-300',
        Overdue: 'text-onErrorContainer dark:text-dark-onErrorContainer',
    }

    return (
        <div 
            onClick={onCardClick}
            className={`p-4 bg-surface dark:bg-dark-surface rounded-xl border border-outlineVariant/50 dark:border-dark-outlineVariant/50 border-l-4 ${statusColor[assignment.status]} cursor-pointer hover:shadow-md hover:border-primary dark:hover:border-dark-primary transition-all`}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onCardClick()}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-onSurface dark:text-dark-onSurface truncate">{assignment.title}</h3>
                    <p className="text-sm text-onSurfaceVariant dark:text-dark-onSurfaceVariant">{assignment.subject}</p>
                </div>
                 <div className="relative ml-2">
                    <select
                        value={assignment.status}
                        onChange={(e) => onStatusChange(e.target.value as Assignment['status'])}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs font-medium rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary transition-colors appearance-none cursor-pointer py-1 pl-3 pr-8 ${selectStatusColor[assignment.status]}`}
                        aria-label={`Update status for ${assignment.title}`}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronDown className={`h-4 w-4 ${selectStatusIconColor[assignment.status]}`} />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-onSurface dark:text-dark-onSurface">{formatDueDate(assignment.dueDate)}</p>
                {assignment.links && assignment.links.length > 0 && (
                    <div className="flex items-center text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                        <Link size={12} className="mr-1"/>
                        <span>{assignment.links.length}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const SummarySkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-onSurface/10 dark:bg-dark-onSurface/10 rounded-md w-3/4"></div>
        <div className="h-4 bg-onSurface/10 dark:bg-dark-onSurface/10 rounded-md"></div>
        <div className="h-4 bg-onSurface/10 dark:bg-dark-onSurface/10 rounded-md w-5/6"></div>
        <div className="h-4 bg-onSurface/10 dark:bg-dark-onSurface/10 rounded-md w-1/2"></div>
    </div>
);

const filterButtons: { label: string; value: Assignment['status'] | 'All' }[] = [
    { label: 'All', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Submitted', value: 'Submitted' },
    { label: 'Overdue', value: 'Overdue' }
];

type SortOption = 'dueSoon' | 'dueLater';

const Assignments: React.FC = () => {
    const { assignments, setAssignments } = useContext(UserContext);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [isNewAssignment, setIsNewAssignment] = useState(false);
    const [activeFilter, setActiveFilter] = useState<Assignment['status'] | 'All'>('All');
    const [sortBy, setSortBy] = useState<SortOption>('dueSoon');
    
    const [textToSummarize, setTextToSummarize] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Stats for Progress Bar
    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(a => a.status === 'Submitted').length;
    const progress = totalAssignments === 0 ? 0 : Math.round((completedAssignments / totalAssignments) * 100);

    // Effect to automatically update status to 'Overdue'
    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const updatedAssignments = assignments.map(a => {
            const dueDate = new Date(a.dueDate);
            if (a.status === 'Pending' && dueDate < today) {
                return { ...a, status: 'Overdue' as 'Overdue' };
            }
            return a;
        });

        if (JSON.stringify(updatedAssignments) !== JSON.stringify(assignments)) {
            setAssignments(updatedAssignments);
        }
    }, [assignments, setAssignments]);

    const handleStatusChange = (id: number, newStatus: Assignment['status']) => {
        setAssignments(prevAssignments =>
            prevAssignments.map(assignment =>
                assignment.id === id ? { ...assignment, status: newStatus } : assignment
            )
        );
    };

    const handleSaveAssignment = (assignmentToSave: Assignment) => {
        setAssignments(prev => {
            if (isNewAssignment) {
                return [...prev, assignmentToSave];
            }
            return prev.map(a => (a.id === assignmentToSave.id ? assignmentToSave : a));
        });
        setSelectedAssignment(null);
        setIsNewAssignment(false);
    };

    const handleDeleteAssignment = (id: number) => {
        setAssignments(prev => prev.filter(a => a.id !== id));
        setSelectedAssignment(null);
        setIsNewAssignment(false);
    };

    const handleNewAssignment = () => {
        setIsNewAssignment(true);
        setSelectedAssignment({
            id: Date.now(),
            title: '',
            subject: '',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'Pending',
            description: '',
            links: []
        });
    };
    
    const handleSummarize = async () => {
        if (!textToSummarize.trim()) return;
        setIsLoading(true);
        setSummary('');
        try {
            const result = await summarizeText(textToSummarize);
            setSummary(result);
        } catch (error) {
            setSummary('<p>An error occurred while summarizing.</p>');
        } finally {
            setIsLoading(false);
        }
    };
    
    const processedAssignments = useMemo(() => {
        let filtered = activeFilter === 'All' ? assignments : assignments.filter(a => a.status === activeFilter);
        
        return filtered.sort((a, b) => {
            const dateA = new Date(a.dueDate).getTime();
            const dateB = new Date(b.dueDate).getTime();
            return sortBy === 'dueSoon' ? dateA - dateB : dateB - dateA;
        });
    }, [assignments, activeFilter, sortBy]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                     {/* Progress Card */}
                    <div className="p-6 bg-surfaceVariant/30 dark:bg-dark-surfaceVariant/30 rounded-3xl border border-outlineVariant/20 dark:border-dark-outlineVariant/20">
                        <div className="flex items-center justify-between mb-4">
                             <h2 className="text-lg font-semibold text-onSurface dark:text-dark-onSurface flex items-center gap-2">
                                <CheckCircle2 className="text-primary dark:text-dark-primary" size={20}/>
                                Completion Progress
                             </h2>
                             <span className="text-2xl font-bold text-primary dark:text-dark-primary">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-surfaceVariant dark:bg-dark-surfaceVariant rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary dark:bg-dark-primary transition-all duration-1000 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant mt-3 text-center">
                            {completedAssignments} completed out of {totalAssignments} total assignments
                        </p>
                    </div>

                    <div className="p-6 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileText size={80} className="text-primary dark:text-dark-primary" />
                        </div>
                        <h2 className="text-lg font-semibold mb-3 text-onSurface dark:text-dark-onSurface flex items-center gap-2">
                            <Wand2 size={18} className="text-tertiary dark:text-dark-tertiary" />
                            AI Note Summarizer
                        </h2>
                        <textarea
                            className="w-full h-40 p-3 text-sm border bg-surface dark:bg-dark-surface border-outlineVariant dark:border-dark-outlineVariant rounded-xl resize-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary text-onSurface dark:text-dark-onSurface placeholder-onSurfaceVariant"
                            placeholder="Paste your lecture notes or any text here..."
                            value={textToSummarize}
                            onChange={(e) => setTextToSummarize(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSummarize}
                            disabled={isLoading || !textToSummarize.trim()}
                            className="mt-3 w-full flex justify-center items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-full shadow-md shadow-primary/20 hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed dark:disabled:bg-dark-primary/50 transition-colors"
                        >
                            {isLoading ? (
                                <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing & Summarizing... </>
                            ) : (
                                <> <Wand2 className="mr-2 h-4 w-4" /> Generate Concise Summary </>
                            )}
                        </button>
                    </div>
                    {(isLoading || summary) && (
                        <div className="p-6 bg-surface dark:bg-dark-surface border border-outlineVariant/50 dark:border-dark-outlineVariant/50 rounded-3xl shadow-sm animate-in fade-in-0 slide-in-from-bottom-2">
                             <h2 className="text-lg font-semibold mb-4 text-onSurface dark:text-dark-onSurface flex items-center gap-2">
                                <span className="bg-tertiaryContainer dark:bg-dark-tertiaryContainer text-tertiary dark:text-dark-tertiary p-1 rounded-md">
                                    <FileText size={16} />
                                </span>
                                Summary Result
                             </h2>
                             {isLoading ? <SummarySkeleton /> : (
                                <div 
                                    className="prose prose-sm dark:prose-invert max-w-none text-onSurface dark:text-dark-onSurface"
                                    dangerouslySetInnerHTML={{ __html: summary }}
                                />
                             )}
                        </div>
                    )}
                </div>
                <div className="space-y-6">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-onSurface dark:text-dark-onSurface">Assignment List</h2>
                        <button onClick={handleNewAssignment} className="flex items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-full shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Assignment
                        </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="p-1 bg-surfaceVariant dark:bg-dark-surfaceVariant rounded-full flex items-center space-x-1 overflow-x-auto">
                            {filterButtons.map(btn => (
                                <button
                                    key={btn.value}
                                    onClick={() => setActiveFilter(btn.value)}
                                    className={`flex-1 whitespace-nowrap px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                                        activeFilter === btn.value
                                            ? 'bg-surface text-primary shadow-sm dark:bg-dark-surface dark:text-dark-primary'
                                            : 'text-onSurfaceVariant hover:bg-onSurface/5 dark:text-dark-onSurfaceVariant dark:hover:bg-dark-onSurface/5'
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="appearance-none w-full sm:w-auto pl-3 pr-8 py-2 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border border-transparent rounded-lg text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary cursor-pointer"
                            >
                                <option value="dueSoon">Due Soonest</option>
                                <option value="dueLater">Due Latest</option>
                            </select>
                            <ArrowUpDown size={14} className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-onSurfaceVariant pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {processedAssignments.map((assignment) => (
                            <AssignmentCard
                                key={assignment.id}
                                assignment={assignment}
                                onStatusChange={(newStatus) => handleStatusChange(assignment.id, newStatus)}
                                onCardClick={() => {
                                    setSelectedAssignment(assignment);
                                    setIsNewAssignment(false);
                                }}
                            />
                        ))}
                        {processedAssignments.length === 0 && (
                            <div className="text-center py-10 text-onSurfaceVariant dark:text-dark-onSurfaceVariant opacity-60">
                                No assignments found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {selectedAssignment && (
                <AssignmentModal 
                    assignment={selectedAssignment} 
                    onClose={() => setSelectedAssignment(null)} 
                    onSave={handleSaveAssignment}
                    onDelete={handleDeleteAssignment}
                    isNew={isNewAssignment}
                />
            )}
        </>
    );
};

export default Assignments;
