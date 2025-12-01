
import React, { useContext, useState, useRef } from 'react';
import { UserContext } from '../App';
import { type UserProfile } from '../types';
import { BookUser, Building2, Edit, Save, XCircle, Camera, User, Calendar, GraduationCap } from 'lucide-react';
import { ToastContext } from '../contexts/ToastContext';

const InfoPill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
    <div className="flex items-center p-2 px-3 bg-secondaryContainer dark:bg-dark-secondaryContainer rounded-lg">
        {icon}
        <span className="ml-2 text-sm text-onSecondaryContainer dark:text-dark-onSecondaryContainer">{text}</span>
    </div>
);

const Profile: React.FC = () => {
    const userContext = useContext(UserContext);
    const toastContext = useContext(ToastContext);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editableProfile, setEditableProfile] = useState<UserProfile | null>(userContext?.userProfile || null);

    if (!userContext || !editableProfile || !toastContext) {
        return null; // or a loading spinner
    }

    const { userProfile, setUserProfile } = userContext;
    const { addToast } = toastContext;

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditableProfile(userProfile); // Reset changes on entering edit mode
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableProfile(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setEditableProfile(prev => prev ? { ...prev, avatar: event.target.result as string } : null);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (editableProfile) {
            setUserProfile(editableProfile);
            addToast('Profile updated successfully!', 'success');
        }
        setIsEditing(false);
    };

    const triggerFileSelect = () => fileInputRef.current?.click();

    const currentAvatar = isEditing ? editableProfile.avatar : userProfile.avatar;

    return (
        <div className="space-y-8">
            <div className="p-6 bg-surfaceVariant/50 dark:bg-dark-surfaceVariant/50 rounded-3xl">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative flex-shrink-0">
                        {currentAvatar ? (
                            <img className="w-32 h-32 rounded-full ring-4 ring-primary/20 object-cover" src={currentAvatar} alt="Avatar" />
                        ) : (
                            <div className="w-32 h-32 rounded-full ring-4 ring-primary/20 bg-secondaryContainer dark:bg-dark-secondaryContainer flex items-center justify-center">
                                <User size={48} className="text-onSecondaryContainer dark:text-dark-onSecondaryContainer" />
                            </div>
                        )}
                        {isEditing && (
                            <>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                                <button onClick={triggerFileSelect} aria-label="Change avatar" className="absolute bottom-1 right-1 bg-surface dark:bg-dark-surface p-2 rounded-full shadow-md hover:bg-surfaceVariant dark:hover:bg-dark-surfaceVariant transition-colors border border-outlineVariant/50 dark:border-dark-outlineVariant/50">
                                    <Camera size={18} className="text-onSurface dark:text-dark-onSurface" />
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex-1 w-full">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Name</label>
                                        <input id="name" type="text" name="name" value={editableProfile.name} onChange={handleInputChange} className="w-full p-2 text-sm border bg-surface dark:bg-dark-surface border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                                    </div>
                                    <div>
                                        <label htmlFor="rollNo" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Roll Number</label>
                                        <input id="rollNo" type="text" name="rollNo" value={editableProfile.rollNo} onChange={handleInputChange} className="w-full p-2 text-sm border bg-surface dark:bg-dark-surface border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Department</label>
                                    <input id="department" type="text" name="department" value={editableProfile.department} onChange={handleInputChange} className="w-full p-2 text-sm border bg-surface dark:bg-dark-surface border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="semester" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Current Semester</label>
                                        <input id="semester" type="text" name="semester" placeholder="e.g. 5th Semester" value={editableProfile.semester || ''} onChange={handleInputChange} className="w-full p-2 text-sm border bg-surface dark:bg-dark-surface border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                                    </div>
                                    <div>
                                        <label htmlFor="academicYear" className="block text-sm font-medium text-onSurfaceVariant dark:text-dark-onSurfaceVariant mb-1">Academic Year</label>
                                        <input id="academicYear" type="text" name="academicYear" placeholder="e.g. 2024-2025" value={editableProfile.academicYear || ''} onChange={handleInputChange} className="w-full p-2 text-sm border bg-surface dark:bg-dark-surface border-outlineVariant dark:border-dark-outlineVariant rounded-lg focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-bold text-onSurface dark:text-dark-onSurface">{userProfile.name}</h2>
                                <p className="text-md text-primary dark:text-dark-primary font-medium">{userProfile.semester || 'Semester Not Set'} Student</p>
                                <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                                    <InfoPill icon={<BookUser size={16} className="text-onSecondaryContainer dark:text-dark-onSecondaryContainer" />} text={userProfile.rollNo} />
                                    <InfoPill icon={<Building2 size={16} className="text-onSecondaryContainer dark:text-dark-onSecondaryContainer" />} text={userProfile.department} />
                                    {userProfile.academicYear && (
                                        <InfoPill icon={<Calendar size={16} className="text-onSecondaryContainer dark:text-dark-onSecondaryContainer" />} text={userProfile.academicYear} />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

             <div className="flex justify-end gap-2">
                {isEditing ? (
                    <>
                        <button onClick={handleEditToggle} className="flex items-center px-4 py-2 text-sm font-semibold text-onSecondaryContainer bg-secondaryContainer rounded-full hover:bg-secondaryContainer/80 dark:bg-dark-secondaryContainer dark:text-dark-onSecondaryContainer dark:hover:bg-dark-secondaryContainer/80 transition-colors">
                            <XCircle size={16} className="mr-2" /> Cancel
                        </button>
                        <button onClick={handleSave} className="flex items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary rounded-full shadow-md hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-onPrimary transition-colors">
                            <Save size={16} className="mr-2" /> Save Changes
                        </button>
                    </>
                ) : (
                    <button onClick={handleEditToggle} className="flex items-center px-4 py-2 text-sm font-semibold text-onPrimary bg-primary rounded-full shadow-md hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-onPrimary transition-colors">
                        <Edit size={16} className="mr-2" /> Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;
