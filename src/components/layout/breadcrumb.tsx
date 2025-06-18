import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ items, className, showHome = true, separator }, ref) => {
    const defaultSeparator = <ChevronRight className="w-4 h-4 text-foreground/40" />;
    const separatorElement = separator || defaultSeparator;

    // Ana sayfa item'ı
    const homeItem: BreadcrumbItem = {
      label: 'Ana Sayfa',
      href: '/',
      icon: Home
    };

    // Tüm items listesi
    const allItems = showHome ? [homeItem, ...items] : items;

    return (
      <nav 
        ref={ref}
        className={cn('flex items-center space-x-1', className)}
        aria-label="Breadcrumb"
      >
        <ol className="flex items-center space-x-1">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const ItemIcon = item.icon;

            return (
              <li key={index} className="flex items-center">
                {/* Separator (önceki item'dan sonra) */}
                {index > 0 && (
                  <span className="mx-2" aria-hidden="true">
                    {separatorElement}
                  </span>
                )}

                {/* Breadcrumb Item */}
                {isLast ? (
                  // Son item - link değil, sadece text
                  <span 
                    className="flex items-center gap-1.5 text-body-small font-medium text-foreground"
                    aria-current="page"
                  >
                    {ItemIcon && (
                      <ItemIcon className="w-4 h-4" />
                    )}
                    <span>{item.label}</span>
                  </span>
                ) : (
                  // Diğer item'lar - linkli
                  <a
                    href={item.href}
                    className="flex items-center gap-1.5 text-body-small text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {ItemIcon && (
                      <ItemIcon className="w-4 h-4" />
                    )}
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

// Breadcrumb Container bileşeni (sayfa başlıkları ile birlikte)
interface BreadcrumbContainerProps {
  items: BreadcrumbItem[];
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const BreadcrumbContainer = React.forwardRef<HTMLDivElement, BreadcrumbContainerProps>(
  ({ items, title, description, className, children }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn('bg-card border-b border-border', className)}
      >
        <div className="container mx-auto px-4 py-6">
          
          {/* Breadcrumb */}
          <Breadcrumb items={items} className="mb-4" />

          {/* Page Header */}
          {(title || description || children) && (
            <div className="space-y-2">
              {title && (
                <h1 className="text-heading-2 text-foreground font-bold">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-body text-foreground/70 max-w-2xl">
                  {description}
                </p>
              )}
              {children}
            </div>
          )}

        </div>
      </div>
    );
  }
);

BreadcrumbContainer.displayName = 'BreadcrumbContainer';

export default Breadcrumb; 