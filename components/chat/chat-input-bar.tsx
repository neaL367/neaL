'use client';

import React, { type RefObject } from 'react';
import { stripNonEnglish } from '@/lib/chat/english';
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from '@/components/ui/input-group';

export interface ChatInputBarProps {
  input: string;
  setInput: (value: string) => void;
  isStreaming: boolean;
  suggestions: string[];
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  useWebSearch: boolean;
  setUseWebSearch: (value: boolean | ((prev: boolean) => boolean)) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onReset: () => void;
}

export function ChatInputBar({
  input,
  setInput,
  isStreaming,
  suggestions,
  textareaRef,
  useWebSearch,
  setUseWebSearch,
  onSend,
  onStop,
  onReset,
}: ChatInputBarProps) {
  return (
    <div className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5 text-xs flex-1">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              disabled={isStreaming}
              className="shrink-0 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-600 dark:text-zinc-300 transition text-[11px] cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={isStreaming}
          className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 shrink-0 cursor-pointer px-1 py-0.5"
          title="Reset conversation state"
        >
          Reset
        </button>
      </div>

      <form
        onSubmit={e => {
          e.preventDefault();
          onSend(input);
        }}
        className="w-full"
      >
        <InputGroup>
          <InputGroupTextarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(stripNonEnglish(e.target.value))}
            onKeyDownSubmit={() => onSend(input)}
            placeholder="English only — ask Nara anything, or /quiz..."
            rows={1}
            className="min-h-[38px] max-h-28 text-xs sm:text-sm py-2"
          />
          <InputGroupAddon align="block-end">
            <button
              type="button"
              onClick={() => setUseWebSearch(prev => !prev)}
              disabled={isStreaming}
              aria-label="Toggle web search"
              aria-pressed={useWebSearch}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition cursor-pointer disabled:opacity-50 select-none ${
                useWebSearch
                  ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
              title={useWebSearch ? 'Web search enabled (click to turn off)' : 'Search the web (click to turn on)'}
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                />
              </svg>
              <span className="text-[10px] hidden sm:inline">
                {useWebSearch ? 'Web ON' : 'Web'}
              </span>
            </button>

            <InputGroupText className="text-[10px] hidden sm:inline ml-auto">
              {isStreaming ? 'Streaming...' : 'Enter to send'}
            </InputGroupText>

            {isStreaming ? (
              <InputGroupButton
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={onStop}
                aria-label="Stop generating"
                className="ml-auto text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </InputGroupButton>
            ) : (
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                disabled={!input.trim()}
                aria-label="Send message"
                className="ml-auto"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </InputGroupButton>
            )}
          </InputGroupAddon>
        </InputGroup>
      </form>
    </div>
  );
}
