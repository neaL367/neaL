'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
  MessageFooter,
} from '@/components/ui/message';
import { Bubble, BubbleContent, BubbleGroup } from '@/components/ui/bubble';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Markdown } from '@/components/ui/markdown';
import { Marker, MarkerIcon, MarkerContent } from '@/components/ui/marker';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: Array<{
    title: string;
    heading?: string;
    url?: string;
    excerpt: string;
  }>;
  timestamp: string;
  isStreaming?: boolean;
}

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      type="button"
      className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
      title="Copy message"
      aria-label="Copy message"
    >
      {copied ? (
        <>
          <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-500">Copied</span>
        </>
      ) : (
        <>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export function ChatMessageItem({ msg }: { msg: ChatMessage }) {
  return (
    <Message align={msg.sender === 'user' ? 'end' : 'start'}>
      <MessageAvatar>
        <Avatar className="size-6.5 ring-1 ring-zinc-200/80 dark:ring-zinc-800/80 shrink-0">
          {msg.sender === 'user' ? (
            <AvatarFallback className="bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] font-semibold">
              ME
            </AvatarFallback>
          ) : (
            <AvatarFallback className="bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 text-white font-semibold text-[10px]">
              N
            </AvatarFallback>
          )}
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          {msg.sender === 'user' ? 'You' : 'Nara'}
        </MessageHeader>
        <BubbleGroup>
          <Bubble variant={msg.sender === 'user' ? 'default' : 'muted'}>
            <BubbleContent aria-live={msg.isStreaming ? 'polite' : undefined}>
              {msg.sender === 'assistant' ? (
                msg.text ? (
                  <Markdown content={msg.text} />
                ) : (
                  <Marker className="py-0.5 px-0">
                    <MarkerIcon>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                      </div>
                    </MarkerIcon>
                    <MarkerContent className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      Thinking...
                    </MarkerContent>
                  </Marker>
                )
              ) : (
                msg.text
              )}
            </BubbleContent>
          </Bubble>
        </BubbleGroup>

        {/* Source Citations */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="w-full max-w-full pt-1.5 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider select-none">
              <svg
                className="w-3 h-3 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span>Sources ({msg.sources.length})</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {msg.sources.map((src, i) => {
                const isExt = src.url?.startsWith('http');
                const href = isExt ? src.url : src.url === '#' ? '/writing' : (src.url || '/');
                const cleanDomain = src.heading && !src.heading.includes('Overview')
                  ? src.heading
                  : (() => {
                      try {
                        return new URL(src.url || '').hostname.replace(/^www\./, '');
                      } catch {
                        return src.title.slice(0, 20);
                      }
                    })();

                return (
                  <Link
                    key={i}
                    href={href as Route}
                    target={isExt ? '_blank' : undefined}
                    rel={isExt ? 'noopener noreferrer' : undefined}
                    title={`${src.title}\n\n"${src.excerpt.replace(/\*\*/g, '').slice(0, 140)}..."`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/90 dark:bg-zinc-900/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] transition-all cursor-pointer max-w-[210px] shadow-2xs group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 group-hover:bg-blue-500 transition-colors shrink-0" />
                    <span className="truncate font-medium">{cleanDomain}</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-transform shrink-0">
                      ↗
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions & Metadata */}
        <MessageFooter>
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            {msg.timestamp}
          </span>
          {msg.sender === 'assistant' && msg.id !== 'welcome' && !msg.isStreaming && msg.text && (
            <CopyButton text={msg.text} />
          )}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
}
