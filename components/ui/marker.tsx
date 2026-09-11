import * as React from 'react';
import { cn } from '@/lib/utils';

export type MarkerProps = React.HTMLAttributes<HTMLDivElement>;

export const Marker = React.forwardRef<HTMLDivElement, MarkerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          'flex items-center gap-2 px-1 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 select-none animate-in fade-in duration-150',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Marker.displayName = 'Marker';

export type MarkerIconProps = React.HTMLAttributes<HTMLDivElement>;

export const MarkerIcon = React.forwardRef<HTMLDivElement, MarkerIconProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center shrink-0', className)}
        {...props}
      />
    );
  }
);
MarkerIcon.displayName = 'MarkerIcon';

export type MarkerContentProps = React.HTMLAttributes<HTMLDivElement>;

export const MarkerContent = React.forwardRef<HTMLDivElement, MarkerContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1.5 font-sans leading-none', className)}
        {...props}
      />
    );
  }
);
MarkerContent.displayName = 'MarkerContent';
