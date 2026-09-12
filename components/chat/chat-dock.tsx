'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SiteChat } from './site-chat';

export function ChatDock() {
  const [isOpen, setIsOpen] = useState(false);

  const isMac = React.useSyncExternalStore(
    () => () => {},
    () => typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent || navigator.platform),
    () => false
  );

  const toggleOpen = useCallback((nextState: boolean) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.startViewTransition(() => {
        setIsOpen(nextState);
      });
    } else {
      setIsOpen(nextState);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        toggleOpen(false);
      }
    };

    const handleOpenCustomEvent = () => {
      toggleOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-nara-chat', handleOpenCustomEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-nara-chat', handleOpenCustomEvent);
    };
  }, [isOpen, toggleOpen]);

  return (
    <>
      {/* ─── Collapsed Bottom-Right Floating Launcher ─────────────────────── */}
      {!isOpen && (
        <aside
          aria-label="Ask Nara"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center"
        >
          <button
            onClick={() => toggleOpen(true)}
            style={{ viewTransitionName: 'chat-dock' }}
            className="group flex items-center gap-2 px-3.5 py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-transform text-xs font-medium cursor-pointer"
            title="Chat with Nara (⌘K)"
          >
            <svg
              className="w-4 h-4 shrink-0 text-rose-400 dark:text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="font-sans">Ask Nara</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-zinc-800 dark:bg-zinc-200 text-zinc-300 dark:text-zinc-700">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>
        </aside>
      )}

      {/* ─── Expanded Bottom-Right Anchored Popup ─────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nara Assistant Chat"
          data-lenis-prevent
          style={{ viewTransitionName: 'chat-dock' }}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-[380px] sm:w-[410px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[82vh] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-shadow"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                N
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Nara
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <kbd className="hidden sm:inline text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-1 py-0.5 rounded">
                ESC
              </kbd>
              <button
                onClick={() => toggleOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Close Chat"
                title="Close chat"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Conversational Feed with Bottom Input */}
          <div className="flex-1 min-h-0">
            <SiteChat className="h-full" />
          </div>
        </div>
      )}
    </>
  );
}
