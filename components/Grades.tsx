import React, { useState, useMemo, useContext, useEffect } from 'react';
import { type Semester, type SubjectGrade } from '../types';
import { PlusCircle, Edit, Trash2, X, Save, GraduationCap, ChevronDown, Plus, TrendingUp } from 'lucide-react';
import { UserContext } from '../App';
import { ToastContext } from '../contexts/ToastContext';

// Modal for adding/editing a subject
const SubjectModal: React.FC<{
    subject: Partial<SubjectGrade>;
    onClose: () => void;
    onSave: (subject: SubjectGrade) => void;
}> = ({ subject, onClose, onSave }) => {
    const [editableSubject, setEditableSubject] = useState<Partial<SubjectGrade>>(subject);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'number') {
            const numericValue = parseFloat(value);
            if (isNaN(numericValue)) {
                setEditableSubject(prev => ({ ...prev, [name]: undefined }));
                return;
            }
            if (name === 'gradePoint') {
                setEditableSubject(prev => ({ ...prev, [name]: Math.max(0, Math.min(10, numericValue)) }));
            } else {
                setEditableSubject(prev => ({ ...prev, [name]: Math.max(0, numericValue) }));
            }
        } else {
            setEditableSubject(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        if (editableSubject.subjectName && editableSubject.credits != null && editableSubject.gradePoint != null) {
            const finalSubject: SubjectGrade = {
                id: editableSubject.id || Date.now(),
                ...editableSubject
            } as SubjectGrade;
            onSave(finalSubject);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in-0" onClick={onClose}>
            <div className="relative bg-surface dark:bg-dark-surface rounded-3xl shadow-xl p-6 m-4 w-full max-w-md animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-onSurfaceVariant dark:text-dark-onSurfaceVariant hover:text-onSurface dark:hover:text-dark-onSurface"><X size={24} /></button>
                <h2 className="text-xl font-bold mb-6">{subject.id ? 'Edit Subject' : 'Add New Subject'}</h2>
                <div className="space-y-4">
                    <input type="text" name="subjectName" placeholder="Subject Name (e.g., Software Engineering)" value={editableSubject.subjectName || ''} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                    <div className="flex gap-4">
                        <input type="number" name="credits" placeholder="Credits" value={editableSubject.credits ?? ''} onChange={handleChange} min="0" className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                        <input type="number" name="gradePoint" placeholder="Grade Point (0-10)" step="0.1" min="0" max="10" value={editableSubject.gradePoint ?? ''} onChange={handleChange} className="w-full p-2 text-sm border bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} className="flex items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-full shadow-md hover:bg-primary/90"><Save className="mr-2 h-4 w-4" /> Save</button>
                </div>
            </div>
        </div>
    );
};

const getGradeColor = (gpa: number) => {
    if (gpa >= 8.5) return 'text-green-500';
    if (gpa >= 6.0) return 'text-amber-500';
    return 'text-error dark:text-dark-error';
};
const getGradeBarColor = (gpa: number) => {
    if (gpa >= 8.5) return 'fill-green-500';
    if (gpa >= 6.0) return 'fill-amber-500';
    return 'fill-error dark:fill-dark-error';
};

const PerformanceChart: React.FC<{ semesters: Semester[] }> = ({ semesters }) => {
    const chartData = semesters.map(sem => ({
        name: `Sem ${sem.semesterNumber}`,
        sgpa: parseFloat(calculateSgpa(sem.subjects).toFixed(2)),
    }));
    
    const maxSgpa = 10;
    const chartHeight = 150;
    const barWidth = 30;
    const barMargin = 15;
    const chartWidth = chartData.length * (barWidth + barMargin);

    return (
        <div className="overflow-x-auto p-4">
            <svg width={chartWidth} height={chartHeight + 20} className="font-sans">
                {chartData.map((data, index) => {
                    const barHeight = (data.sgpa / maxSgpa) * chartHeight;
                    const x = index * (barWidth + barMargin);
                    return (
                        <g key={index}>
                            <rect
                                x={x}
                                y={chartHeight - barHeight}
                                width={barWidth}
                                height={barHeight}
                                className={`${getGradeBarColor(data.sgpa)} transition-all duration-500`}
                                rx="4"
                            />
                            <text x={x + barWidth / 2} y={chartHeight - barHeight - 5} textAnchor="middle" fontSize="12" className="fill-onSurfaceVariant dark:fill-dark-onSurfaceVariant font-semibold">{data.sgpa}</text>
                            <text x={x + barWidth / 2} y={chartHeight + 15} textAnchor="middle" fontSize="12" className="fill-onSurfaceVariant dark:fill-dark-onSurfaceVariant">{data.name}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const calculateSgpa = (subjects: SubjectGrade[]): number => {
    if (subjects.length === 0) return 0;
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    if (totalCredits === 0) return 0;
    const weightedSum = subjects.reduce((sum, s) => sum + (s.credits * s.gradePoint), 0);
    return weightedSum / totalCredits;
};

const Grades: React.FC = () => {
    const { semesters, setSemesters } = useContext(UserContext);
    const { addToast } = useContext(ToastContext);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<Partial<SubjectGrade> | null>(null);
    const [activeSemesterId, setActiveSemesterId] = useState<number | null>(null);
    const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (semesters.length > 0) {
            const latestSemesterId = Math.max(...semesters.map(s => s.id));
            if (!expandedSemesters.has(latestSemesterId)) {
                setExpandedSemesters(prev => new Set(prev).add(latestSemesterId));
            }
        }
    }, [semesters.length]);

    const { overallCgpa, totalCredits, totalSubjects } = useMemo(() => {
        const allSubjects = semesters.flatMap(s => s.subjects);
        const cgpa = calculateSgpa(allSubjects);
        const credits = allSubjects.reduce((sum, s) => sum + s.credits, 0);
        return { overallCgpa: cgpa, totalCredits: credits, totalSubjects: allSubjects.length };
    }, [semesters]);

    const handleAddSemester = () => {
        const nextSemesterNumber = semesters.length > 0 ? Math.max(...semesters.map(s => s.semesterNumber)) + 1 : 1;
        const newSemester: Semester = {
            id: Date.now(),
            semesterNumber: nextSemesterNumber,
            subjects: [],
        };
        setSemesters(prev => [...prev, newSemester].sort((a,b) => a.semesterNumber - b.semesterNumber));
        addToast(`Semester ${nextSemesterNumber} added!`, 'success');
    };

    const handleDeleteSemester = (id: number) => {
        if (window.confirm('Are you sure you want to delete this entire semester?')) {
            setSemesters(prev => prev.filter(s => s.id !== id));
            addToast('Semester deleted.', 'info');
        }
    };

    const handleOpenModal = (semesterId: number, subject: Partial<SubjectGrade> | null = null) => {
        setActiveSemesterId(semesterId);
        setEditingSubject(subject || {});
        setIsModalOpen(true);
    };

    const handleSaveSubject = (subjectToSave: SubjectGrade) => {
        setSemesters(prev => prev.map(sem => {
            if (sem.id === activeSemesterId) {
                const existingIndex = sem.subjects.findIndex(s => s.id === subjectToSave.id);
                if (existingIndex > -1) {
                    const updatedSubjects = [...sem.subjects];
                    updatedSubjects[existingIndex] = subjectToSave;
                    addToast('Subject updated!', 'success');
                    return { ...sem, subjects: updatedSubjects };
                } else {
                    addToast('Subject added!', 'success');
                    return { ...sem, subjects: [...sem.subjects, subjectToSave] };
                }
            }
            return sem;
        }));
        setIsModalOpen(false);
        setEditingSubject(null);
        setActiveSemesterId(null);
    };

    const handleDeleteSubject = (semesterId: number, subjectId: number) => {
        setSemesters(prev => prev.map(sem => {
            if (sem.id === semesterId) {
                return { ...sem, subjects: sem.subjects.filter(s => s.id !== subjectId) };
            }
            return sem;
        }));
        addToast('Subject deleted.', 'info');
    };
    
    const toggleSemester = (id: number) => {
        setExpandedSemesters(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={handleAddSemester} className="flex items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary dark:text-dark-onPrimary dark:bg-dark-primary rounded-full shadow-md shadow-primary/20 hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Semester
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl text-center">
                        <h3 className="text-lg font-semibold text-onSurfaceVariant dark:text-dark-onSurfaceVariant">Overall CGPA</h3>
                        <p className={`text-6xl font-bold mt-2 ${getGradeColor(overallCgpa)}`}>{overallCgpa.toFixed(2)}</p>
                    </div>
                    <div className="p-6 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl">
                         <h3 className="text-lg font-semibold text-onSurface dark:text-dark-onSurface mb-2">Total Stats</h3>
                         <div className="flex justify-around text-center">
                             <div>
                                <p className="text-2xl font-bold text-primary dark:text-dark-primary">{totalCredits}</p>
                                <p className="text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant">Credits Earned</p>
                             </div>
                             <div>
                                <p className="text-2xl font-bold text-primary dark:text-dark-primary">{totalSubjects}</p>
                                <p className="text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant">Subjects Tracked</p>
                             </div>
                         </div>
                    </div>
                    {semesters.length > 0 && (
                        <div className="p-6 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl">
                            <div className="flex items-center mb-2">
                                <TrendingUp className="text-primary dark:text-dark-primary mr-2" size={20} />
                                <h3 className="text-lg font-semibold text-onSurface dark:text-dark-onSurface">Performance Trend</h3>
                            </div>
                            <PerformanceChart semesters={semesters} />
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {semesters.length === 0 ? (
                        <div className="text-center py-16 px-6 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl flex flex-col items-center lg:col-span-2">
                            <GraduationCap className="mx-auto h-12 w-12 text-primary dark:text-dark-primary" />
                            <h2 className="mt-4 text-xl font-semibold">Ready to track your CGPA?</h2>
                            <p className="mt-2 text-onSurfaceVariant dark:text-dark-onSurfaceVariant">Add your first semester to get started.</p>
                        </div>
                    ) : (
                        semesters.map(semester => {
                            const sgpa = calculateSgpa(semester.subjects);
                            const isExpanded = expandedSemesters.has(semester.id);
                            return (
                                <div key={semester.id} className="bg-surface dark:bg-dark-surface rounded-2xl border border-outlineVariant/50 dark:border-dark-outlineVariant/50 overflow-hidden transition-all">
                                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-surfaceVariant/50 dark:hover:bg-dark-surfaceVariant/50" onClick={() => toggleSemester(semester.id)}>
                                        <h3 className="text-lg font-bold text-onSurface dark:text-dark-onSurface">Semester {semester.semesterNumber}</h3>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm font-semibold text-onSurfaceVariant dark:text-dark-onSurfaceVariant">SGPA: <span className={`font-bold ${getGradeColor(sgpa)}`}>{sgpa.toFixed(2)}</span></p>
                                            <ChevronDown size={20} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="px-4 pb-4 animate-in fade-in-0 slide-in-from-top-2">
                                            <div className="space-y-2 mt-2">
                                                 {semester.subjects.map(subject => (
                                                    <div key={subject.id} className="flex items-center justify-between p-2 rounded-lg bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50">
                                                        <div>
                                                            <p className="font-medium text-sm">{subject.subjectName}</p>
                                                            <p className="text-xs text-onSurfaceVariant dark:text-dark-onSurfaceVariant">{subject.credits} Credits</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <p className="font-semibold text-sm">{subject.gradePoint.toFixed(1)}</p>
                                                            <div>
                                                                <button onClick={() => handleOpenModal(semester.id, subject)} className="text-onSurfaceVariant/80 hover:text-blue-500 p-1"><Edit size={14}/></button>
                                                                <button onClick={() => handleDeleteSubject(semester.id, subject.id)} className="text-onSurfaceVariant/80 hover:text-error dark:hover:text-dark-error p-1"><Trash2 size={14}/></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex justify-between items-center">
                                                <button onClick={() => handleDeleteSemester(semester.id)} className="flex items-center text-xs font-semibold text-error hover:text-error/80 dark:text-dark-error dark:hover:text-dark-error/80">
                                                    <Trash2 size={12} className="mr-1.5" /> Delete Semester
                                                </button>
                                                <button onClick={() => handleOpenModal(semester.id)} className="flex items-center text-xs font-semibold text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80">
                                                    <Plus size={12} className="mr-1.5" /> Add Subject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {isModalOpen && (
                <SubjectModal 
                    subject={editingSubject!}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveSubject}
                />
            )}
        </div>
    );
};

export default Grades;