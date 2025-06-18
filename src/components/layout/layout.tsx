import React from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Footer } from './footer';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({ children, className, showHeader = true, showFooter = true }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('min-h-screen flex flex-col', className)}
      >
        {showHeader && <Header />}
        <main className="flex-1">
          {children}
        </main>
        {showFooter && <Footer />}
      </div>
    );
  }
);

Layout.displayName = 'Layout';

export default Layout; 