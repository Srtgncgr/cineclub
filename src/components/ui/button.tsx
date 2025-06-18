import React from 'react';
import { cn } from '@/lib/utils';
import { ButtonSpinner } from './loading';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
      'flex-row'
    ];

    const variants = {
      primary: [
        'bg-primary text-white',
        'hover:bg-primary/90 active:bg-primary/95',
        'focus:ring-primary/50',
        'shadow-sm hover:shadow-md'
      ],
      secondary: [
        'bg-accent text-foreground',
        'hover:bg-accent/80 active:bg-accent/90',
        'focus:ring-accent/50',
        'shadow-sm hover:shadow-md'
      ],
      outline: [
        'border-2 border-border bg-transparent text-foreground',
        'hover:bg-card hover:border-primary/30',
        'active:bg-card/80',
        'focus:ring-primary/30'
      ],
      ghost: [
        'bg-transparent text-foreground',
        'hover:bg-gray-100 active:bg-gray-200',
        'focus:ring-gray-300/50'
      ]
    };

    const sizes = {
      sm: ['px-3 py-1.5 text-sm rounded-lg', 'h-8'],
      md: ['px-4 py-2 text-base rounded-xl', 'h-10'],
      lg: ['px-6 py-3 text-lg rounded-xl', 'h-12']
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && 'cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <ButtonSpinner size={size} />
          </div>
        )}
        <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
export default Button;