'use client';

import React from 'react';

/**
 * Dispatches a custom event to open the Nara ChatDock popup from anywhere.
 */
export function openNaraChat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-nara-chat'));
  }
}

interface NaraTriggerProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Clickable trigger that opens the Nara assistant chat popup.
 * Styled identically to site links with link-animate.
 */
export function NaraTrigger({
  children = 'Nara',
  className = '',
}: NaraTriggerProps) {
  return (
    <button
      type="button"
      onClick={() => openNaraChat()}
      className={`text-zinc-900 dark:text-zinc-100 link-animate cursor-pointer font-normal bg-transparent border-0 p-0 m-0 inline ${className}`}
      title="Chat with Nara (⌘K)"
    >
      {children}
    </button>
  );
}
