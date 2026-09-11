import * as React from 'react';
import { cn } from '@/lib/utils';

interface MessageContextValue {
  align: 'start' | 'end';
}

const MessageContext = React.createContext<MessageContextValue>({
  align: 'start',
});

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'end';
}

export const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ className, align = 'start', children, ...props }, ref) => {
    return (
      <MessageContext.Provider value={{ align }}>
        <div
          ref={ref}
          data-slot="message"
          data-align={align}
          className={cn(
            'group/message relative flex w-full min-w-0 gap-2.5 items-start text-sm',
            align === 'end' ? 'flex-row-reverse' : 'flex-row',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </MessageContext.Provider>
    );
  }
);
Message.displayName = 'Message';

export type MessageGroupProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageGroup = React.forwardRef<HTMLDivElement, MessageGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="message-group"
        className={cn('flex flex-col gap-2.5 sm:gap-3 w-full', className)}
        {...props}
      />
    );
  }
);
MessageGroup.displayName = 'MessageGroup';

export type MessageAvatarProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageAvatar = React.forwardRef<
  HTMLDivElement,
  MessageAvatarProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="message-avatar"
      className={cn('shrink-0 self-start pt-1 select-none flex items-center justify-center', className)}
      {...props}
    />
  );
});
MessageAvatar.displayName = 'MessageAvatar';

export type MessageContentProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageContent = React.forwardRef<
  HTMLDivElement,
  MessageContentProps
>(({ className, children, ...props }, ref) => {
  const { align } = React.useContext(MessageContext);
  return (
    <div
      ref={ref}
      data-slot="message-content"
      className={cn(
        'flex max-w-[85%] sm:max-w-[80%] min-w-0 flex-col gap-1',
        align === 'end' ? 'items-end' : 'items-start',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
MessageContent.displayName = 'MessageContent';

export type MessageHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageHeader = React.forwardRef<
  HTMLDivElement,
  MessageHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="message-header"
      className={cn(
        'text-[11px] font-medium text-zinc-400 dark:text-zinc-500 px-1',
        className
      )}
      {...props}
    />
  );
});
MessageHeader.displayName = 'MessageHeader';

export type MessageFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const MessageFooter = React.forwardRef<
  HTMLDivElement,
  MessageFooterProps
>(({ className, ...props }, ref) => {
  const { align } = React.useContext(MessageContext);
  return (
    <div
      ref={ref}
      data-slot="message-footer"
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 px-1 mt-0.5',
        align === 'end' ? 'justify-end' : 'justify-start',
        className
      )}
      {...props}
    />
  );
});
MessageFooter.displayName = 'MessageFooter';
