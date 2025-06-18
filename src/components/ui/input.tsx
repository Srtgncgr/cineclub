import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size = 'md', error = false, label, helperText, errorMessage, ...props }, ref) => {
    const baseStyles = [
      'flex w-full rounded-xl border border-border bg-background',
      'text-foreground placeholder:text-foreground/50',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50'
    ];

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg'
    };

    const states = {
      normal: [
        'focus:ring-primary/50 focus:border-primary/50',
        'hover:border-primary/30'
      ],
      error: [
        'border-red-500 focus:ring-red-500/50 focus:border-red-500',
        'hover:border-red-600'
      ]
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-small font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            baseStyles,
            sizes[size],
            error ? states.error : states.normal,
            className
          )}
          ref={ref}
          {...props}
        />
        {(helperText || errorMessage) && (
          <p className={cn(
            'mt-2 text-xs',
            error ? 'text-red-600' : 'text-foreground/60'
          )}>
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea bileşeni
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size = 'md', error = false, label, helperText, errorMessage, ...props }, ref) => {
    const baseStyles = [
      'flex w-full rounded-xl border border-border bg-background',
      'text-foreground placeholder:text-foreground/50',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'resize-none'
    ];

    const sizes = {
      sm: 'min-h-[80px] px-3 py-2 text-sm',
      md: 'min-h-[100px] px-4 py-3 text-base',
      lg: 'min-h-[120px] px-5 py-4 text-lg'
    };

    const states = {
      normal: [
        'focus:ring-primary/50 focus:border-primary/50',
        'hover:border-primary/30'
      ],
      error: [
        'border-red-500 focus:ring-red-500/50 focus:border-red-500',
        'hover:border-red-600'
      ]
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-body-small font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            baseStyles,
            sizes[size],
            error ? states.error : states.normal,
            className
          )}
          ref={ref}
          {...props}
        />
        {(helperText || errorMessage) && (
          <p className={cn(
            'mt-2 text-xs',
            error ? 'text-red-600' : 'text-foreground/60'
          )}>
            {error ? errorMessage : helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Label bileşeni
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required = false, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-body-small font-medium text-foreground mb-2',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Input, Textarea, Label, type InputProps, type TextareaProps };
export default Input; 