'use client';

import React, {
  type HTMLAttributes,
  type TextareaHTMLAttributes,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
} from 'react';

export function InputGroup({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      className={`relative flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 shadow-xs focus-within:border-zinc-400 dark:focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-400/20 transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface InputGroupTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
  onKeyDownSubmit?: () => void;
}

export function InputGroupTextarea({
  ref,
  className = '',
  rows = 1,
  onKeyDown,
  onKeyDownSubmit,
  ...props
}: InputGroupTextareaProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (onKeyDownSubmit) {
        e.preventDefault();
        onKeyDownSubmit();
      }
    }
    onKeyDown?.(e);
  };

  return (
    <textarea
      ref={ref}
      data-slot="input-group-control"
      rows={rows}
      onKeyDown={handleKeyDown}
      className={`w-full resize-none border-0 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0 leading-relaxed ${className}`}
      {...props}
    />
  );
}

interface InputGroupInputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
}

export function InputGroupInput({
  ref,
  className = '',
  ...props
}: InputGroupInputProps) {
  return (
    <input
      ref={ref}
      data-slot="input-group-control"
      className={`w-full border-0 bg-transparent px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-0 ${className}`}
      {...props}
    />
  );
}


interface InputGroupAddonProps extends HTMLAttributes<HTMLDivElement> {
  align?: 'inline-start' | 'inline-end' | 'block-start' | 'block-end';
}

export function InputGroupAddon({
  align = 'block-end',
  className = '',
  children,
  ...props
}: InputGroupAddonProps) {
  const alignClasses = {
    'inline-start': 'flex items-center ps-3',
    'inline-end': 'flex items-center pe-3',
    'block-start': 'flex items-center px-3 pt-2 pb-1',
    'block-end': 'flex items-center justify-between px-2.5 pb-2 pt-0.5',
  }[align];

  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={`${alignClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface InputGroupButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'icon-xs' | 'sm' | 'icon-sm';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export function InputGroupButton({
  size = 'icon-sm',
  variant = 'default',
  className = '',
  children,
  ...props
}: InputGroupButtonProps) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px] rounded-md h-6',
    'icon-xs': 'size-6 rounded-md p-1',
    sm: 'px-2.5 py-1 text-xs rounded-lg h-7',
    'icon-sm': 'size-7 rounded-lg p-1.5',
  }[size];

  const variantClasses = {
    default:
      'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none',
    outline:
      'border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95',
    ghost:
      'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95',
    secondary:
      'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95',
  }[variant];

  return (
    <button
      data-slot="input-group-button"
      className={`inline-flex items-center justify-center font-medium transition-all cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function InputGroupText({
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="input-group-text"
      className={`text-xs text-zinc-400 dark:text-zinc-500 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
