import React from 'react';
import { Link } from '@/components/link';
import { SiteChat } from '@/components/chat/site-chat';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nara | Neal367',
  description: 'Chat with Nara, Neal’s personal AI companion and site assistant.',
};

export default function ChatPage() {
  return (
    <section className="flex flex-col h-[calc(100vh-5rem)] max-h-[850px] pb-4">
      <div className="mb-3">
        <div className="mb-2">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-wider text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-100 transition-colors"
          >
            Neal367
          </Link>
        </div>
        <h1 className="font-semibold text-2xl tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          Chat with Nara ✨
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Explore Neal’s engineering work, co-op experience, articles, or chat about movies, science, and web development.
        </p>
      </div>

      <div className="flex-1 min-h-0 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white/50 dark:bg-zinc-950/40 shadow-sm">
        <SiteChat className="h-full" />
      </div>
    </section>
  );
}
