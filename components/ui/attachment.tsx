import * as React from 'react';
import { cn } from '@/lib/utils';

export type AttachmentProps = React.HTMLAttributes<HTMLDivElement>;

export const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2.5 p-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition w-full',
          className
        )}
        {...props}
      />
    );
  }
);
Attachment.displayName = 'Attachment';

export type AttachmentMediaProps = React.HTMLAttributes<HTMLDivElement>;

export const AttachmentMedia = React.forwardRef<
  HTMLDivElement,
  AttachmentMediaProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300',
        className
      )}
      {...props}
    />
  );
});
AttachmentMedia.displayName = 'AttachmentMedia';

export type AttachmentContentProps = React.HTMLAttributes<HTMLDivElement>;

export const AttachmentContent = React.forwardRef<
  HTMLDivElement,
  AttachmentContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col gap-0.5 min-w-0 flex-1', className)}
      {...props}
    />
  );
});
AttachmentContent.displayName = 'AttachmentContent';

export type AttachmentTitleProps = React.HTMLAttributes<HTMLDivElement>;

export const AttachmentTitle = React.forwardRef<
  HTMLDivElement,
  AttachmentTitleProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'font-medium text-[11px] text-zinc-900 dark:text-zinc-100 truncate',
        className
      )}
      {...props}
    />
  );
});
AttachmentTitle.displayName = 'AttachmentTitle';

export type AttachmentDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

export const AttachmentDescription = React.forwardRef<
  HTMLDivElement,
  AttachmentDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 italic',
        className
      )}
      {...props}
    />
  );
});
AttachmentDescription.displayName = 'AttachmentDescription';

export type AttachmentActionsProps = React.HTMLAttributes<HTMLDivElement>;

export const AttachmentActions = React.forwardRef<
  HTMLDivElement,
  AttachmentActionsProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-1 shrink-0 text-zinc-400', className)}
      {...props}
    />
  );
});
AttachmentActions.displayName = 'AttachmentActions';
