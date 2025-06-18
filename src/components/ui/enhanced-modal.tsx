'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useAccessibilityPreferences } from '@/hooks/useResponsive';
import { focusManagement } from '@/lib/responsive-utils';
import { X } from 'lucide-react';

interface EnhancedModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  animation?: 'fade' | 'scale' | 'slide-up' | 'slide-down';
  preventScroll?: boolean;
  focusTrap?: boolean;
  returnFocus?: boolean;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  overlayClassName,
  animation = 'scale',
  preventScroll = true,
  focusTrap = true,
  returnFocus = true,
  ariaLabelledBy,
  ariaDescribedBy
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { prefersReducedMotion } = useAccessibilityPreferences();

  // Mount detection for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle focus trap and return focus
  useEffect(() => {
    if (!isOpen) return;

    // Store the element that was focused before opening modal
    previousActiveElement.current = document.activeElement as HTMLElement;

    if (focusTrap && modalRef.current) {
      const cleanup = focusManagement.trapFocus(modalRef.current);
      return cleanup;
    }
  }, [isOpen, focusTrap]);

  // Return focus when modal closes
  useEffect(() => {
    if (!isOpen && returnFocus && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen, returnFocus]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventScroll]);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Animation classes
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-300 ease-out';
    
    if (prefersReducedMotion) {
      return baseClasses;
    }

    switch (animation) {
      case 'fade':
        return cn(baseClasses, 'transition-opacity');
      case 'scale':
        return cn(baseClasses, isOpen ? 'animate-scale-in' : 'animate-scale-out');
      case 'slide-up':
        return cn(baseClasses, isOpen ? 'animate-slide-in-up' : 'slide-out-down');
      case 'slide-down':
        return cn(baseClasses, isOpen ? 'animate-slide-in-down' : 'slide-out-up');
      default:
        return baseClasses;
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-none w-full h-full m-0 rounded-none'
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        overlayClassName
      )}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy || (title ? 'modal-title' : undefined)}
      aria-describedby={ariaDescribedBy}
    >
      {/* Backdrop */}
      <div 
        className={cn(
          'absolute inset-0 bg-black/50 backdrop-blur-sm',
          prefersReducedMotion 
            ? 'transition-none' 
            : 'transition-all duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden',
          'focus:outline-none',
          sizeClasses[size],
          getAnimationClasses(),
          className
        )}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 
                id={ariaLabelledBy || 'modal-title'}
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'p-2 -m-2 text-gray-400 hover:text-gray-600 rounded-lg',
                  'focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'transition-colors duration-200',
                  'touch-target'
                )}
                aria-label="Modalı kapat"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'overflow-y-auto scrollbar-thin',
          title || showCloseButton ? 'p-6' : 'p-0'
        )}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  variant = 'info',
  loading = false
}) => {
  const variantStyles = {
    danger: {
      button: 'bg-red-500 hover:bg-red-600 text-white',
      icon: '⚠️'
    },
    warning: {
      button: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      icon: '⚠️'
    },
    info: {
      button: 'bg-primary hover:bg-primary/90 text-white',
      icon: 'ℹ️'
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      animation="scale"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img" aria-hidden="true">
            {variantStyles[variant].icon}
          </span>
          <p className="text-gray-700 leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg font-medium',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200',
              variantStyles[variant].button
            )}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Yükleniyor...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg font-medium',
              'bg-gray-100 hover:bg-gray-200 text-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500/50',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </EnhancedModal>
  );
};

// Image Modal
interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  src,
  alt,
  title
}) => {
  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      animation="fade"
      className="bg-black"
      overlayClassName="bg-black/80"
      showCloseButton={true}
    >
      <div className="relative">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto max-h-[80vh] object-contain"
          loading="lazy"
        />
        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <h3 className="text-white text-lg font-semibold">{title}</h3>
          </div>
        )}
      </div>
    </EnhancedModal>
  );
}; 