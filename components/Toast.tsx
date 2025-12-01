
import React, { useEffect, useState } from 'react';
import { CheckCircle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
};

const colors = {
  success: 'bg-green-600 text-white dark:bg-green-500',
  info: 'bg-blue-600 text-white dark:bg-blue-500',
  error: 'bg-red-600 text-white dark:bg-red-500',
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
    
    // Cleanup to animate out after the parent's timeout removes the component.
    return () => setIsVisible(false);
  }, []);

  return (
    <div
      role="alert"
      className={`relative flex items-center p-4 pr-10 rounded-lg shadow-lg text-sm w-full max-w-sm transition-all duration-300 transform animate-in fade-in-0 slide-in-from-top-5 ${colors[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="ml-3 font-medium">{message}</div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-1/2 right-2 transform -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;