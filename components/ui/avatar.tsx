import * as React from 'react';
import { cn } from '@/lib/utils';

export type AvatarProps = React.HTMLAttributes<HTMLDivElement>;

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-200/80 dark:border-zinc-800/80',
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = 'Avatar';

export type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

export const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt = '', ...props }, ref) => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={ref}
      alt={alt}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
);
AvatarImage.displayName = 'AvatarImage';

export type AvatarFallbackProps = React.HTMLAttributes<HTMLDivElement>;

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  AvatarFallbackProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono font-medium text-zinc-600 dark:text-zinc-300',
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';
