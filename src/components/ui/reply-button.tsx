'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReplyButtonProps {
  onReply?: () => void;
  replyCount?: number;
  isReplying?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'outline';
  showCount?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: {
    button: 'text-xs px-2 py-1',
    icon: 'w-3 h-3',
    gap: 'gap-1'
  },
  md: {
    button: 'text-sm px-3 py-1.5',
    icon: 'w-4 h-4',
    gap: 'gap-1.5'
  },
  lg: {
    button: 'text-base px-4 py-2',
    icon: 'w-5 h-5',
    gap: 'gap-2'
  }
};

export const ReplyButton: React.FC<ReplyButtonProps> = ({
  onReply,
  replyCount = 0,
  isReplying = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  showCount = true,
  className,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizes = sizeClasses[size];

  const handleClick = () => {
    if (!disabled && onReply) {
      onReply();
    }
  };

  const getButtonVariant = () => {
    if (isReplying) return 'primary';
    if (variant === 'outline') return 'outline';
    if (variant === 'minimal') return 'ghost';
    return 'ghost';
  };

  return (
    <Button
      variant={getButtonVariant()}
      size="sm"
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center transition-all duration-200',
        sizes.button,
        sizes.gap,
        
        // Color states
        isReplying 
          ? 'text-primary bg-primary/10 border-primary/20' 
          : 'text-gray-600 hover:text-primary',
          
        // Animation
        'transform hover:scale-105 active:scale-95',
        
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
        
        className
      )}
      title={isReplying ? 'Yanıt formunu kapat' : 'Yanıtla'}
    >
      {/* Icon with rotation animation */}
      <Reply 
        className={cn(
          sizes.icon,
          'transition-transform duration-200',
          isHovered && !disabled && 'rotate-12',
          isReplying && 'rotate-180'
        )} 
      />
      
      {/* Text */}
      {children || (
        <span className="font-medium">
          {isReplying ? 'İptal' : 'Yanıtla'}
        </span>
      )}
      
      {/* Reply count */}
      {showCount && replyCount > 0 && (
        <span className={cn(
          'px-1.5 py-0.5 rounded-full text-xs font-semibold transition-colors',
          isReplying
            ? 'bg-primary/20 text-primary'
            : 'bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary'
        )}>
          {replyCount}
        </span>
      )}
      
      {/* Loading indicator for async operations */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
          <div className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-4 h-4',
            size === 'lg' && 'w-5 h-5'
          )} />
        </div>
      )}
    </Button>
  );
};

// Enhanced Reply Button with more features
export const EnhancedReplyButton: React.FC<ReplyButtonProps & {
  tooltip?: string;
  showRipple?: boolean;
}> = ({
  tooltip,
  showRipple = true,
  className,
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (showRipple && !props.disabled) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
      }, 600);
    }
    
    props.onReply?.();
  };

  return (
    <div className="relative inline-block" title={tooltip}>
      <Button
        variant={props.isReplying ? 'primary' : 'ghost'}
        size="sm"
        onClick={handleClick}
        disabled={props.disabled}
        className={cn(
          'relative overflow-hidden',
          'flex items-center gap-2 text-gray-600 hover:text-primary',
          'transition-all duration-200 transform hover:scale-105 active:scale-95',
          props.isReplying && 'text-primary bg-primary/10',
          props.disabled && 'opacity-50 cursor-not-allowed hover:scale-100',
          className
        )}
      >
        <Reply className={cn(
          'w-4 h-4 transition-transform duration-200',
          props.isReplying && 'rotate-180'
        )} />
        
        <span className="font-medium">
          {props.children || (props.isReplying ? 'İptal' : 'Yanıtla')}
        </span>
        
        {props.showCount && props.replyCount && props.replyCount > 0 && (
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
            {props.replyCount}
          </span>
        )}

        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute animate-ping bg-primary/30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}
      </Button>
    </div>
  );
};

export default ReplyButton; 