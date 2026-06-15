import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center p-0 sm:items-center sm:p-6">
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className={`relative z-10 w-full ${sizeStyles[size]} rounded-t-[2rem] border border-white/60 bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-6`}>
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">{title}</h2>
            <button onClick={onClose} className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
              <X size={20} />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
