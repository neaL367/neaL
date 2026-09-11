'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react';

interface MessageScrollerContextValue {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  isAtBottom: boolean;
  canScrollUp: boolean;
  canScrollDown: boolean;
  scrollToBottom: (options?: { behavior?: ScrollBehavior }) => void;
  scrollToMessage: (
    messageId: string,
    options?: { align?: 'start' | 'center' | 'end'; behavior?: ScrollBehavior }
  ) => void;
  onViewportScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

const MessageScrollerContext = createContext<MessageScrollerContextValue | null>(null);

export function useMessageScroller() {
  const context = useContext(MessageScrollerContext);
  if (!context) {
    throw new Error('useMessageScroller must be used within a MessageScrollerProvider');
  }
  return context;
}

export function useMessageScrollerScrollable() {
  const { canScrollUp, canScrollDown } = useMessageScroller();
  return { start: canScrollUp, end: canScrollDown };
}

interface MessageScrollerProviderProps {
  children: ReactNode;
  defaultScrollPosition?: 'start' | 'end';
}

export function MessageScrollerProvider({
  children,
  defaultScrollPosition = 'end',
}: MessageScrollerProviderProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const isAutoScrolling = useRef(false);

  const checkScrollState = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const threshold = 40;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceToBottom <= threshold;
    const atTop = el.scrollTop <= threshold;

    setIsAtBottom(atBottom);
    setCanScrollUp(!atTop && el.scrollTop > 0);
    setCanScrollDown(!atBottom && distanceToBottom > 0);
  }, []);

  const scrollToBottom = useCallback((options?: { behavior?: ScrollBehavior }) => {
    const el = viewportRef.current;
    if (!el) return;
    isAutoScrolling.current = true;
    requestAnimationFrame(() => {
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: options?.behavior ?? 'smooth',
      });
      setTimeout(() => {
        isAutoScrolling.current = false;
        checkScrollState();
      }, 300);
    });
  }, [checkScrollState]);

  const scrollToMessage = useCallback(
    (
      messageId: string,
      options?: { align?: 'start' | 'center' | 'end'; behavior?: ScrollBehavior }
    ) => {
      const el = viewportRef.current;
      if (!el) return;
      const target = el.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
      if (target) {
        target.scrollIntoView({
          block: options?.align ?? 'start',
          behavior: options?.behavior ?? 'smooth',
        });
      }
    },
    []
  );

  const onViewportScroll = useCallback(() => {
    if (!isAutoScrolling.current) {
      checkScrollState();
    }
  }, [checkScrollState]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    if (defaultScrollPosition === 'end') {
      el.scrollTop = el.scrollHeight;
    }

    checkScrollState();
  }, [defaultScrollPosition, checkScrollState]);

  return (
    <MessageScrollerContext.Provider
      value={{
        viewportRef,
        isAtBottom,
        canScrollUp,
        canScrollDown,
        scrollToBottom,
        scrollToMessage,
        onViewportScroll,
      }}
    >
      {children}
    </MessageScrollerContext.Provider>
  );
}

export function MessageScroller({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="message-scroller"
      data-lenis-prevent
      className={`relative flex flex-col min-h-0 w-full flex-1 overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function MessageScrollerViewport({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { viewportRef, isAtBottom, onViewportScroll } = useMessageScroller();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onViewportScroll(e);
    props.onScroll?.(e);
  };

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-label="Messages"
      tabIndex={0}
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      data-at-bottom={isAtBottom}
      onScroll={handleScroll}
      className={`overflow-y-auto overflow-x-hidden flex-1 focus:outline-none overscroll-contain ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface MessageScrollerContentProps extends HTMLAttributes<HTMLDivElement> {
  'aria-busy'?: boolean;
}

export function MessageScrollerContent({
  className = '',
  children,
  'aria-busy': ariaBusy,
  ...props
}: MessageScrollerContentProps) {
  return (
    <div
      role="log"
      aria-relevant="additions"
      aria-busy={ariaBusy}
      className={`flex flex-col gap-4 p-4 min-h-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface MessageScrollerItemProps extends HTMLAttributes<HTMLDivElement> {
  messageId?: string;
  scrollAnchor?: boolean;
}

export function MessageScrollerItem({
  messageId,
  scrollAnchor,
  className = '',
  children,
  ...props
}: MessageScrollerItemProps) {
  return (
    <div
      data-slot="message-scroller-item"
      data-message-id={messageId}
      data-anchor={scrollAnchor ? 'true' : undefined}
      className={`relative transition-opacity duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface MessageScrollerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function MessageScrollerButton({
  className = '',
  label = 'Latest messages',
  ...props
}: MessageScrollerButtonProps) {
  const { isAtBottom, scrollToBottom } = useMessageScroller();

  if (isAtBottom) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => scrollToBottom({ behavior: 'smooth' })}
      className={`absolute bottom-3 right-4 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/95 dark:bg-zinc-900/95 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 shadow-md backdrop-blur hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all animate-in fade-in cursor-pointer ${className}`}
      {...props}
    >
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
