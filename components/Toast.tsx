import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true); // Fade in
    const timer = setTimeout(() => {
      setVisible(false); // Start fade out
      setTimeout(onClose, 300); // Remove after fade out
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  const Icon = type === 'success' ? CheckCircleIcon : ExclamationTriangleIcon;

  return (
    <div
      className={`flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor} transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-3 text-sm font-medium">{message}</div>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-full inline-flex items-center justify-center hover:bg-white/20"
        aria-label="Close"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
