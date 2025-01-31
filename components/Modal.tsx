import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closeButton?: boolean;
}

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = 'lg',
  closeButton = true
}: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'w-[90vw]'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-game-dark rounded-lg shadow-xl ${maxWidthClasses[maxWidth]} max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {(title || closeButton) && (
          <div className="p-6 pb-0 flex-shrink-0 flex justify-between items-center">
            {title && <h3 className="text-xl font-bold text-game-accent">{title}</h3>}
            {closeButton && (
              <button
                onClick={onClose}
                className="text-game-muted hover:text-game-text transition-colors ml-auto"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className="p-6 overflow-auto">
          {children}
        </div>

        {footer && (
          <div className="p-6 pt-0 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 