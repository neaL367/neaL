import * as React from 'react';
import { cn } from '@/lib/utils';

interface BubbleContextValue {
  variant: 'default' | 'muted';
}

const BubbleContext = React.createContext<BubbleContextValue>({
  variant: 'default',
});

export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted';
}

export const Bubble = React.forwardRef<HTMLDivElement, BubbleProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <BubbleContext.Provider value={{ variant }}>
        <div
          ref={ref}
          data-slot="bubble"
          data-variant={variant}
          className={cn(
            'group/bubble relative flex w-fit max-w-full min-w-0 flex-col gap-1',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </BubbleContext.Provider>
    );
  }
);
Bubble.displayName = 'Bubble';

export type BubbleContentProps = React.HTMLAttributes<HTMLDivElement>;

export const BubbleContent = React.forwardRef<
  HTMLDivElement,
  BubbleContentProps
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(BubbleContext);
  return (
    <div
      ref={ref}
      data-slot="bubble-content"
      className={cn(
        'w-fit max-w-full min-w-0 rounded-2xl px-3.5 py-2 text-xs sm:text-[13px] leading-relaxed break-words font-sans transition-colors',
        variant === 'default'
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
          : 'bg-zinc-100/90 text-zinc-900 dark:bg-zinc-900/90 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs',
        className
      )}
      {...props}
    />
  );
});
BubbleContent.displayName = 'BubbleContent';

export type BubbleGroupProps = React.HTMLAttributes<HTMLDivElement>;

export const BubbleGroup = React.forwardRef<HTMLDivElement, BubbleGroupProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('flex flex-col gap-1 w-full', className)} {...props} />;
  }
);
BubbleGroup.displayName = 'BubbleGroup';

export type BubbleReactionsProps = React.HTMLAttributes<HTMLDivElement>;

export const BubbleReactions = React.forwardRef<
  HTMLDivElement,
  BubbleReactionsProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400 shadow-xs select-none',
        className
      )}
      {...props}
    />
  );
});
BubbleReactions.displayName = 'BubbleReactions';
