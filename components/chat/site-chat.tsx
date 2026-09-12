'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ConversationState } from '@/lib/chat/types';
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
  'Quiz me on React',
  'Explain closures',
  'What is Neal’s tech stack?',
  'How does the event loop work?',
  'Why time dilation in Interstellar?',
  'Tell me a joke',
];

const INITIAL_STATE: ConversationState = {
  turns: [],
  topicThread: [],
  activeQuiz: null,
  expertiseLevel: 'intermediate',
  roundRobinCursors: {},
  lastRetrievalHits: [],
  pendingOffer: null,
  coveredConcepts: [],
};

function SiteChatInner({ className = '' }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I'm **Nara** — Neal's personal AI companion running directly on-server (zero external LLM APIs). Ask me about Neal's stack, co-op experience, engineering essays, coding concepts, or type `/quiz` to test your knowledge!",
      timestamp: 'Online',
    },
  ]);
  const [input, setInput] = useState('');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_STARTERS);
  const [conversationState, setConversationState] = useState<ConversationState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('nara_session_state');
        if (saved) return JSON.parse(saved);
      } catch {
        // Storage unavailable or disabled
      }
    }
    return INITIAL_STATE;
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const idCounter = useRef(1);
  const { scrollToBottom } = useMessageScroller();

  // Save session state to sessionStorage
  const updateSessionState = useCallback((nextState: ConversationState) => {
    setConversationState(nextState);
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
          state: conversationState,
          webSearch: useWebSearch,
        }),
        signal: abortController.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
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
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId ? { ...m, sources: parsedSources } : m
                )
              );
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

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                text: m.text || "Something went wrong — please try again in a moment!",
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
    updateSessionState(INITIAL_STATE);
    setSuggestions(DEFAULT_STARTERS);
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Session refreshed! Ask me anything about Neal's work, tech stack, or type `/quiz` to begin.",
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
        useWebSearch={useWebSearch}
        setUseWebSearch={setUseWebSearch}
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
