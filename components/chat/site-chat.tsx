'use client';

import React, { useState, useRef, useEffect, useOptimistic, useTransition, useCallback, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { NaraResponse } from '@/lib/chat/nara-brain';
import {
  Message, MessageGroup, MessageAvatar, MessageContent, MessageHeader, MessageFooter,
} from '@/components/ui/message';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Markdown } from '@/components/ui/markdown';
import {
  Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle,
  AttachmentDescription, AttachmentActions,
} from '@/components/ui/attachment';
import {
  MessageScrollerProvider, MessageScroller, MessageScrollerViewport,
  MessageScrollerContent, MessageScrollerItem, MessageScrollerButton,
  useMessageScroller,
} from '@/components/ui/message-scroller';
import {
  InputGroup, InputGroupTextarea, InputGroupAddon,
  InputGroupButton, InputGroupText,
} from '@/components/ui/input-group';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: NaraResponse['sources'];
  timestamp: string;
  animating?: boolean;
}

const STARTERS = [
  'Quiz me on React',
  'Explain closures',
  'How does flexbox work?',
  'What is Neal\'s tech stack?',
  'Interstellar movie?',
  'Tell me a joke',
];

// ── Typing animation component ────────────────────────────────────────────────
function TypingMessage({ text, onDone }: { text: string; onDone: () => void }) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [count, setCount] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    const id = setInterval(() => {
      setCount((prev) => {
        const next = Math.min(prev + 5, words.length);
        if (next >= words.length && !doneRef.current) {
          doneRef.current = true;
          clearInterval(id);
          // small delay so the last word is visible before onDone fires
          setTimeout(onDone, 80);
        }
        return next;
      });
    }, 18);
    return () => clearInterval(id);
  }, [words.length, onDone]);

  const displayed = words.slice(0, count).join('');
  return <Markdown content={displayed || '\u200b'} />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  }, [text]);
  return (
    <button onClick={handleCopy} type="button"
      className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
      title="Copy message" aria-label="Copy message">
      {copied ? (
        <><svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-emerald-500">Copied</span></>
      ) : (
        <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg><span>Copy</span></>
      )}
    </button>
  );
}

function SiteChatInner({ className = '' }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome', sender: 'assistant',
    text: "Hi! I'm **Nara** ✨ — Neal's personal AI companion. Ask me about Neal's work, tech stack, co-op experience, articles, movies, or anything you're curious about!",
    timestamp: 'Online',
  }]);
  const [input, setInput] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idCounter = useRef(1);
  const { scrollToBottom } = useMessageScroller();

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, userMsg: ChatMessage) => [...state, userMsg]
  );

  useEffect(() => {
    const raf = requestAnimationFrame(() => scrollToBottom({ behavior: 'smooth' }));
    return () => cancelAnimationFrame(raf);
  }, [optimisticMessages.length, isWaiting, scrollToBottom]);

  const handleSend = async (userText: string) => {
    const q = userText.trim();
    if (!q || isWaiting) return;
    setInput('');
    const currentId = idCounter.current++;
    const userMsgId = `user-${currentId}`;
    const assistantMsgId = `assistant-${currentId}`;

    const userMsg: ChatMessage = { id: userMsgId, sender: 'user', text: q, timestamp: 'Just now' };
    const history = messages.filter((m) => m.id !== 'welcome').slice(-8).map((m) => ({ sender: m.sender, text: m.text }));

    setIsWaiting(true);
    startTransition(() => addOptimisticMessage(userMsg));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, history }),
      });
      const data: NaraResponse = await res.json();

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: data.text || "I couldn't process that right now.",
        sources: data.sources,
        timestamp: 'Just now',
        animating: true,
      };
      startTransition(() => {
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setIsWaiting(false);
        setAnimatingId(assistantMsgId);
      });
    } catch {
      const errMsg: ChatMessage = {
        id: assistantMsgId, sender: 'assistant',
        text: "Something went wrong — please try again!", timestamp: 'Just now', animating: true,
      };
      startTransition(() => {
        setMessages((prev) => [...prev, userMsg, errMsg]);
        setIsWaiting(false);
        setAnimatingId(assistantMsgId);
      });
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <MessageScroller className="flex-1 min-h-0">
        <MessageScrollerViewport className="px-3.5 py-4">
          <MessageScrollerContent aria-busy={isWaiting} className="p-0">
            <MessageGroup className="gap-3 sm:gap-3.5">
              {optimisticMessages.map((msg) => (
                <MessageScrollerItem key={msg.id} messageId={msg.id}
                  scrollAnchor={msg.sender === 'user'}
                  className="animate-in fade-in-50 duration-200 ease-out">
                  <Message align={msg.sender === 'user' ? 'end' : 'start'}>
                    <MessageAvatar>
                      <Avatar className="size-6.5 ring-1 ring-zinc-200/80 dark:ring-zinc-800/80 shrink-0">
                        {msg.sender === 'user' ? (
                          <AvatarFallback className="bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] font-semibold">ME</AvatarFallback>
                        ) : (
                          <AvatarFallback className="bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 text-white font-semibold text-[10px]">N</AvatarFallback>
                        )}
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>{msg.sender === 'user' ? 'You' : 'Nara'}</MessageHeader>
                      <Bubble variant={msg.sender === 'user' ? 'default' : 'muted'}>
                        <BubbleContent>
                          {msg.sender === 'assistant' ? (
                            msg.animating && animatingId === msg.id ? (
                              <TypingMessage key={msg.id} text={msg.text} onDone={() => {
                                setAnimatingId(null);
                                setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, animating: false } : m));
                              }} />
                            ) : (
                              <Markdown content={msg.text} />
                            )
                          ) : (
                            msg.text
                          )}
                        </BubbleContent>
                      </Bubble>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="w-full max-w-full space-y-1.5 pt-1">
                          {msg.sources.map((src, i) => {
                            const isExt = src.url.startsWith('http');
                            return (
                              <Link key={i} href={(isExt ? src.url : src.url === '#' ? '/writing' : src.url) as Route}
                                target={isExt ? '_blank' : undefined}
                                rel={isExt ? 'noopener noreferrer' : undefined}
                                className="block group max-w-full">
                                <Attachment>
                                  <AttachmentMedia>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      {isExt
                                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        : <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />}
                                    </svg>
                                  </AttachmentMedia>
                                  <AttachmentContent>
                                    <AttachmentTitle className="group-hover:underline">{src.title} • {src.heading}</AttachmentTitle>
                                    <AttachmentDescription>&ldquo;{src.excerpt.replace(/\*\*/g, '').slice(0, 100)}&rdquo;</AttachmentDescription>
                                  </AttachmentContent>
                                  <AttachmentActions><span className="text-xs group-hover:translate-x-0.5 transition-transform">→</span></AttachmentActions>
                                </Attachment>
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      {msg.sender === 'assistant' && msg.id !== 'welcome' && !msg.animating && (
                        <MessageFooter><CopyButton text={msg.text} /></MessageFooter>
                      )}
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ))}

              {isWaiting && (
                <MessageScrollerItem messageId="thinking-marker" className="animate-in fade-in-50 duration-200 ease-out">
                  <Message align="start">
                    <MessageAvatar>
                      <Avatar className="size-6.5 ring-1 ring-rose-500/20 shrink-0">
                        <AvatarFallback className="bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 text-white font-semibold text-[10px]">N</AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-zinc-100/90 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800/60 px-3 py-1.5 shadow-xs">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                        </div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Thinking...</span>
                      </div>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              )}
            </MessageGroup>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>

      <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-3 space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5 text-xs">
          {STARTERS.map((s) => (
            <button key={s} type="button" onClick={() => handleSend(s)} disabled={isWaiting}
              className="shrink-0 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-300 transition text-[11px] cursor-pointer disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="w-full">
          <InputGroup>
            <InputGroupTextarea ref={textareaRef} value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDownSubmit={() => handleSend(input)}
              placeholder="Ask Nara anything..." rows={1}
              className="min-h-[38px] max-h-28 text-xs sm:text-sm py-2" />
            <InputGroupAddon align="block-end">
              <InputGroupText className="text-[10px] hidden sm:inline">Enter to send</InputGroupText>
              <InputGroupButton type="submit" variant="default" size="icon-sm"
                disabled={!input.trim() || isWaiting} aria-label="Send message" className="ml-auto">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </div>
    </div>
  );
}

export function SiteChat({ className = '' }: { className?: string }) {
  return (
    <MessageScrollerProvider>
      <SiteChatInner className={className} />
    </MessageScrollerProvider>
  );
}
