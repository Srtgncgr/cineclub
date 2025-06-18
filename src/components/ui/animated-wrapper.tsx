'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAccessibilityPreferences } from '@/hooks/useResponsive';

interface AnimatedWrapperProps {
  children: React.ReactNode;
  animation?: 'fade-in' | 'slide-in-up' | 'slide-in-down' | 'slide-in-left' | 'slide-in-right' | 'scale-in' | 'float' | 'bounce-subtle';
  delay?: number;
  duration?: number;
  trigger?: 'mount' | 'scroll' | 'hover' | 'click';
  threshold?: number;
  className?: string;
  once?: boolean;
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 300,
  trigger = 'mount',
  threshold = 0.1,
  className,
  once = true
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'mount');
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useAccessibilityPreferences();

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    if (trigger === 'scroll') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && (!once || !hasAnimated)) {
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, delay);
          } else if (!once) {
            setIsVisible(false);
          }
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }

    if (trigger === 'mount') {
      setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, delay);
    }
  }, [trigger, delay, threshold, once, hasAnimated, prefersReducedMotion]);

  const handleInteraction = () => {
    if ((trigger === 'hover' || trigger === 'click') && (!once || !hasAnimated)) {
      setIsVisible(true);
      setHasAnimated(true);
    }
  };

  const animationClasses = {
    'fade-in': 'animate-fade-in',
    'slide-in-up': 'animate-slide-in-up',
    'slide-in-down': 'animate-slide-in-down',
    'slide-in-left': 'animate-slide-in-left',
    'slide-in-right': 'animate-slide-in-right',
    'scale-in': 'animate-scale-in',
    'float': 'animate-float',
    'bounce-subtle': 'animate-bounce-subtle'
  };

  const baseClasses = [
    'transition-all',
    prefersReducedMotion ? 'duration-0' : `duration-${duration}`,
    !isVisible && !prefersReducedMotion && 'opacity-0'
  ];

  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        isVisible && !prefersReducedMotion && animationClasses[animation],
        isVisible && 'opacity-100',
        className
      )}
      onMouseEnter={trigger === 'hover' ? handleInteraction : undefined}
      onClick={trigger === 'click' ? handleInteraction : undefined}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  );
};

// Specialized animation components
export const FadeIn: React.FC<Omit<AnimatedWrapperProps, 'animation'>> = (props) => (
  <AnimatedWrapper {...props} animation="fade-in" />
);

export const SlideInUp: React.FC<Omit<AnimatedWrapperProps, 'animation'>> = (props) => (
  <AnimatedWrapper {...props} animation="slide-in-up" />
);

export const SlideInDown: React.FC<Omit<AnimatedWrapperProps, 'animation'>> = (props) => (
  <AnimatedWrapper {...props} animation="slide-in-down" />
);

export const SlideInLeft: React.FC<Omit<AnimatedWrapperProps, 'animation'>> = (props) => (
  <AnimatedWrapper {...props} animation="slide-in-left" />
);

export const SlideInRight: React.FC<Omit<AnimatedWrapperProps, 'animation'>> = (props) => (
  <AnimatedWrapper {...props} animation="slide-in-right" />
);

export const ScaleIn: React.FC<Omit<AnimatedWrapperProps, 'animation'>> = (props) => (
  <AnimatedWrapper {...props} animation="scale-in" />
);

// Staggered children animation
interface StaggeredAnimationProps {
  children: React.ReactNode;
  staggerDelay?: number;
  animation?: AnimatedWrapperProps['animation'];
  trigger?: AnimatedWrapperProps['trigger'];
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 100,
  animation = 'fade-in',
  trigger = 'scroll',
  className
}) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <AnimatedWrapper
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          trigger={trigger}
        >
          {child}
        </AnimatedWrapper>
      ))}
    </div>
  );
};

// Floating animation for decorative elements
interface FloatingElementProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  intensity = 'medium',
  direction = 'up',
  className
}) => {
  const { prefersReducedMotion } = useAccessibilityPreferences();

  const intensityClasses = {
    subtle: 'animate-bounce-subtle',
    medium: 'animate-float',
    strong: 'animate-bounce'
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn(intensityClasses[intensity], className)}>
      {children}
    </div>
  );
};

// Parallax scrolling effect
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}

export const Parallax: React.FC<ParallaxProps> = ({
  children,
  speed = 0.5,
  className
}) => {
  const [offset, setOffset] = useState(0);
  const { prefersReducedMotion } = useAccessibilityPreferences();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      setOffset(window.pageYOffset * speed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, prefersReducedMotion]);

  return (
    <div
      className={className}
      style={{
        transform: prefersReducedMotion ? 'none' : `translateY(${offset}px)`
      }}
    >
      {children}
    </div>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  return (
    <FadeIn duration={400} className={className}>
      {children}
    </FadeIn>
  );
}; 