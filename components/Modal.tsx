import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  maxWidth = 'lg'
}: ModalProps) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-game-dark rounded-lg shadow-xl w-full ${maxWidthClasses[maxWidth]} animate-in fade-in zoom-in duration-200`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="p-6 pb-0">
            <h3 className="text-xl font-bold text-game-accent">{title}</h3>
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="p-6 pt-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal; 