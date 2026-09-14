'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DialogueState } from '@/lib/nara/client';
import { createInitialState, parseStoredState } from '@/lib/nara/client';
import {
  MessageGroup,
} from '@/components/ui/message';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  useMessageScroller,
} from '@/components/ui/message-scroller';
import { ChatMessageItem, type ChatMessage } from './chat-message-item';
import { ChatInputBar } from './chat-input-bar';

export type { ChatMessage };

const DEFAULT_STARTERS = [
  'Tell me about GTA V',
  'What is the RAGE engine?',
  'Explain Hot Coffee',
  'Tell me about Rockstar North',
  'Why is GTA V so successful?',
  'Who is Neal?',
];

function SiteChatInner({ className = '' }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I'm **Nara** — Neal's personal AI companion running directly on-server (zero external LLM APIs). Ask me about Rockstar Games — GTA, Red Dead, the studios behind them — or about Neal's own work.",
      timestamp: 'Online',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_STARTERS);
  const [DialogueState, setDialogueState] = useState<DialogueState>(() => {
    if (typeof window !== 'undefined') {
      try {
        return parseStoredState(sessionStorage.getItem('nara_session_state'));
      } catch {
        // Storage unavailable or disabled
      }
    }
    return createInitialState();
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idCounter = useRef(1);
  const { scrollToBottom } = useMessageScroller();

  // Save session state to sessionStorage
  const updateSessionState = useCallback((nextState: DialogueState) => {
    setDialogueState(nextState);
    try {
      sessionStorage.setItem('nara_session_state', JSON.stringify(nextState));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Auto-scroll on new content
  useEffect(() => {
    const raf = requestAnimationFrame(() => scrollToBottom({ behavior: 'smooth' }));
    return () => cancelAnimationFrame(raf);
  }, [messages, isStreaming, scrollToBottom]);

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setMessages(prev =>
        prev.map(m => (m.isStreaming ? { ...m, isStreaming: false } : m))
      );
    }
  }, []);

  const handleSend = async (userText: string) => {
    const query = userText.trim();
    if (!query || isStreaming) return;

    setInput('');

    // If active stream exists, cancel it first
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const currentId = idCounter.current++;
    const userMsgId = `user-${currentId}`;
    const assistantMsgId = `assistant-${currentId}`;

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: 'Just now',
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, initialAssistantMsg]);
    setIsStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          state: DialogueState,
        }),
        signal: abortController.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          typeof errBody?.error === 'string' && errBody.error
            ? errBody.error
            : `HTTP ${res.status}`
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = 'message';
          let eventData = '';

          const blockLines = block.split('\n');
          for (const line of blockLines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6);
            }
          }

          if (eventType === 'text') {
            let chunk = '';
            try {
              chunk = JSON.parse(eventData);
            } catch {
              chunk = eventData;
            }
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, text: m.text + chunk } : m
              )
            );
          } else if (eventType === 'sources') {
            try {
              const parsedSources = JSON.parse(eventData);
              // Validate at the boundary. The renderer dereferences `title`
              // unconditionally, so a malformed payload must not reach it —
              // one bad entry previously took down the whole transcript.
              const safeSources = Array.isArray(parsedSources)
                ? parsedSources.filter(
                    (s): s is { title: string; heading?: string; url?: string; excerpt?: string } =>
                      !!s && typeof s === 'object' && typeof s.title === 'string',
                  )
                : [];
              if (safeSources.length > 0) {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMsgId ? { ...m, sources: safeSources } : m
                  )
                );
              }
            } catch {
              // Ignore source parse errors
            }
          } else if (eventType === 'suggestions') {
            try {
              const newSuggestions = JSON.parse(eventData);
              if (Array.isArray(newSuggestions) && newSuggestions.length > 0) {
                setSuggestions(newSuggestions);
              }
            } catch {
              // Ignore suggestion parse errors
            }
          } else if (eventType === 'state') {
            try {
              const updatedState = JSON.parse(eventData);
              updateSessionState(updatedState);
            } catch {
              // Ignore state parse errors
            }
          } else if (eventType === 'done') {
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsgId ? { ...m, isStreaming: false } : m
              )
            );
          }
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return;
      }

      const errMessage =
        typeof (err as Error)?.message === 'string' &&
        (err as Error).message &&
        !(err as Error).message.startsWith('HTTP ')
          ? (err as Error).message
          : null;

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                text:
                  m.text ||
                  errMessage ||
                  "Something went wrong — please try again in a moment!",
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleResetSession = () => {
    updateSessionState(createInitialState());
    setSuggestions(DEFAULT_STARTERS);
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Session refreshed! Ask me anything about Rockstar Games or Neal's own work.",
        timestamp: 'Online',
      },
    ]);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <MessageScroller className="flex-1 min-h-0">
        <MessageScrollerViewport className="px-3.5 py-4">
          <MessageScrollerContent aria-busy={isStreaming} className="p-0">
            <MessageGroup className="gap-3 sm:gap-3.5">
              {messages.map(msg => (
                <MessageScrollerItem
                  key={msg.id}
                  messageId={msg.id}
                  scrollAnchor={msg.sender === 'user'}
                  className="animate-in fade-in-50 duration-200 ease-out"
                >
                  <ChatMessageItem msg={msg} />
                </MessageScrollerItem>
              ))}
            </MessageGroup>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>

      <ChatInputBar
        input={input}
        setInput={setInput}
        isStreaming={isStreaming}
        suggestions={suggestions}
        textareaRef={textareaRef}
        onSend={handleSend}
        onStop={handleStop}
        onReset={handleResetSession}
      />
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
