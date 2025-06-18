'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// Toast türleri
type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast interface
interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider
interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Otomatik kapanma
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Toast Hook
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast Container
function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

// Toast Item bileşeni
interface ToastItemProps {
  toast: Toast;
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animasyon için delay
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeToast(toast.id), 200);
  };

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      descColor: 'text-green-700'
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      descColor: 'text-red-700'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      descColor: 'text-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      descColor: 'text-blue-700'
    }
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg',
        'transform transition-all duration-200 ease-out',
        config.bgColor,
        config.borderColor,
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      )}
    >
      {/* Icon */}
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('text-body-small font-medium', config.titleColor)}>
          {toast.title}
        </h4>
        {toast.description && (
          <p className={cn('text-caption mt-1', config.descColor)}>
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn(
              'text-caption font-medium mt-2 hover:underline',
              config.titleColor
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={cn(
          'p-1 rounded-lg hover:bg-black/5 transition-colors',
          config.iconColor
        )}
        aria-label="Bildirimi kapat"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Standalone Toast bileşeni (provider olmadan kullanım için)
interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ type, title, description, onClose, action, className, ...props }, ref) => {
    const typeConfig = {
      success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        titleColor: 'text-green-900',
        descColor: 'text-green-700'
      },
      error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        titleColor: 'text-red-900',
        descColor: 'text-red-700'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-900',
        descColor: 'text-yellow-700'
      },
      info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        titleColor: 'text-blue-900',
        descColor: 'text-blue-700'
      }
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm',
          config.bgColor,
          config.borderColor,
          className
        )}
        {...props}
      >
        {/* Icon */}
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn('text-body-small font-medium', config.titleColor)}>
            {title}
          </h4>
          {description && (
            <p className={cn('text-caption mt-1', config.descColor)}>
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'text-caption font-medium mt-2 hover:underline',
                config.titleColor
              )}
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'p-1 rounded-lg hover:bg-black/5 transition-colors',
              config.iconColor
            )}
            aria-label="Bildirimi kapat"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Helper functions
export const toast = {
  success: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'success' as const,
    title,
    description,
    ...options
  }),
  error: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'error' as const,
    title,
    description,
    ...options
  }),
  warning: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'warning' as const,
    title,
    description,
    ...options
  }),
  info: (title: string, description?: string, options?: Partial<Toast>) => ({
    type: 'info' as const,
    title,
    description,
    ...options
  })
};

export { type Toast as ToastType, type ToastProps };
export default Toast; 