import React, { useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmButtonClass = isDestructive
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-accent hover:bg-blue-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-surface text-text-primary dark:bg-dark-surface dark:text-dark-text-primary rounded-lg shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border-color dark:border-dark-border">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
        </div>
        <div className="p-6">
          <p className="text-text-secondary dark:text-dark-text-secondary">{message}</p>
        </div>
        <div className="p-4 border-t border-border-color dark:border-dark-border mt-auto flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-dark-border hover:opacity-80 font-semibold transition-opacity"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-semibold transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
