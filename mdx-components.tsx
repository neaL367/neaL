import React from 'react';
import { Link } from '@/components/link';
import { CopyButton } from '@/components/copy-button';
import Image, { ImageProps } from 'next/image';
import type { MDXComponents } from 'mdx/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (!children) return '';
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return extractText(children.props.children);
  }
  return '';
}

// ─── Syntax Highlighting ─────────────────────────────────────────────────────

type Token = { type: string; value: string };

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'new', 'delete', 'typeof',
  'instanceof', 'void', 'in', 'of', 'this', 'super', 'class', 'extends',
  'import', 'export', 'from', 'default', 'as', 'async', 'await', 'yield',
  'try', 'catch', 'finally', 'throw', 'static', 'get', 'set',
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
  'console', 'document', 'window', 'Math', 'JSON', 'Promise',
  'interface', 'type', 'enum', 'implements', 'abstract', 'declare',
  'namespace', 'module', 'require', 'exports',
]);

const HTML_TAGS = new Set([
  'div', 'span', 'p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'pre', 'code', 'blockquote', 'img', 'br', 'hr', 'section', 'article',
  'header', 'footer', 'nav', 'main', 'aside', 'form', 'input', 'button',
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      tokens.push({ type: 'comment', value: code.slice(i, end === -1 ? code.length : end) });
      i = end === -1 ? code.length : end;
    } else if (code[i] === '/' && code[i + 1] === '*') {
      let end = code.indexOf('*/', i + 2);
      if (end !== -1) end += 2;
      else end = code.length;
      tokens.push({ type: 'comment', value: code.slice(i, end) });
      i = end;
    } else if (code[i] === '`') {
      let j = i + 1;
      while (j < code.length && code[j] !== '`') {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
    } else if (code[i] === "'" || code[i] === '"') {
      const quote = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== quote) {
        if (code[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
    } else if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i + 1]))) {
      let j = i;
      if (code[j] === '0' && (code[j + 1] === 'x' || code[j + 1] === 'X')) {
        j += 2;
        while (j < code.length && /[0-9a-fA-F]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[0-9]/.test(code[j])) j++;
        if (j < code.length && code[j] === '.') {
          j++;
          while (j < code.length && /[0-9]/.test(code[j])) j++;
        }
      }
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
    } else if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      const isFunction = j < code.length && code[j] === '(';

      if (JS_KEYWORDS.has(word)) tokens.push({ type: 'keyword', value: word });
      else if (HTML_TAGS.has(word)) tokens.push({ type: 'tag', value: word });
      else if (isFunction) tokens.push({ type: 'function', value: word });
      else tokens.push({ type: 'identifier', value: word });
      i = j;
    } else {
      tokens.push({ type: 'plain', value: code[i] });
      i++;
    }
  }

  return tokens;
}

// ─── Components ──────────────────────────────────────────────────────────────

function HighlightedCode({ code, language }: { code: string; language?: string }) {
  const tokens = tokenize(code);

  return (
    <code className={`language-${language ?? 'text'}`}>
      {tokens.map((token, i) =>
        token.type === 'plain' ? (
          <span key={i}>{token.value}</span>
        ) : (
          <span key={i} className={`token-${token.type}`}>
            {token.value}
          </span>
        ),
      )}
    </code>
  );
}

function CodeBlock({ children, className, ...props }: React.ComponentProps<'pre'>) {
  const codeString = extractText(children).replace(/\n$/, '');
  const language = className?.replace(/^language-/, '') ?? '';

  return (
    <div className="code-block">
      <div className="code-block-header">
        {language && <span className="code-block-language">{language}</span>}
        <CopyButton code={codeString} />
      </div>
      <pre className={className} {...props}>
        <HighlightedCode code={codeString} language={language} />
      </pre>
    </div>
  );
}

function Heading({
  level,
  children,
  className,
  ...props
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
} & React.ComponentProps<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>) {
  const text = extractText(children);
  const id = slugify(text);
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const sizeClasses: Record<number, string> = {
    1: 'mb-6 scroll-m-20 text-2xl font-bold text-zinc-900 dark:text-zinc-100',
    2: 'mt-12 mb-4 scroll-m-20 text-lg font-medium text-zinc-900 dark:text-zinc-100',
    3: 'mt-8 mb-3 scroll-m-20 text-base font-medium text-zinc-900 dark:text-zinc-100',
    4: 'mt-6 mb-2 scroll-m-20 text-sm font-medium text-zinc-900 dark:text-zinc-100',
    5: 'mt-4 mb-2 scroll-m-20 text-sm font-medium text-zinc-900 dark:text-zinc-100',
    6: 'mt-4 mb-2 scroll-m-20 text-sm font-medium text-zinc-900 dark:text-zinc-100',
  };

  return (
    <Tag
      id={id}
      className={`heading-with-anchor ${sizeClasses[level]} ${className ?? ''}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

const CALLOUT_ICONS: Record<string, React.ReactNode> = {
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3L18 17H2L10 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 8V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="0.75" fill="currentColor" />
    </svg>
  ),
  tip: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2C7 2 5 4.5 5 7C5 9 6 10.5 7 12V14H13V12C14 10.5 15 9 15 7C15 4.5 13 2 10 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 18H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  danger: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 7L7 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

function Callout({
  type = 'info',
  children,
}: {
  type?: 'info' | 'warning' | 'tip' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <div className={`callout callout-${type}`}>
      <div className="callout-icon">{CALLOUT_ICONS[type]}</div>
      <div className="callout-content">{children}</div>
    </div>
  );
}

function TableOfContents({
  headings,
}: {
  headings?: { level: number; text: string; id: string }[];
}) {
  if (!headings || headings.length === 0) return null;

  return (
    <nav className="toc">
      <p className="toc-title">Table of Contents</p>
      <ul className="toc-list">
        {headings.map((heading) => (
          <li key={heading.id} className={`toc-item toc-level-${heading.level}`}>
            <a href={`#${heading.id}`} className="toc-link">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MDXImage(props: ImageProps & { caption?: string }) {
  return (
    <figure className="mdx-image">
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        {...props}
        alt={props.alt ?? ''}
      />
      {props.caption && (
        <figcaption className="mdx-image-caption">{props.caption}</figcaption>
      )}
    </figure>
  );
}

// ─── MDX Component Map ───────────────────────────────────────────────────────

const components: MDXComponents = {
  h1: (props) => <Heading level={1} {...props} />,
  h2: (props) => <Heading level={2} {...props} />,
  h3: (props) => <Heading level={3} {...props} />,
  h4: (props) => <Heading level={4} {...props} />,
  h5: (props) => <Heading level={5} {...props} />,
  h6: (props) => <Heading level={6} {...props} />,
  p: ({ children }) => <p className="mb-4 text-zinc-500 dark:text-zinc-400">{children}</p>,
  a: ({ children, href, ...props }) =>
    href ? (
      <Link href={href} {...props}>
        {children}
      </Link>
    ) : (
      <>{children}</>
    ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-4 list-outside list-disc text-zinc-600 dark:text-zinc-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal text-zinc-600 dark:text-zinc-400">{children}</ol>
  ),
  li: ({ children }) => <li className="mb-1 list-inside">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-2 border-zinc-300 pl-4 text-sm text-zinc-600 italic dark:border-zinc-700 dark:text-zinc-400">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
      {children}
    </code>
  ),
  pre: CodeBlock,
  hr: () => (
    <hr className="relative my-8 h-px w-full overflow-hidden border-0 bg-transparent before:absolute before:left-1/2 before:h-px before:w-[99vw] before:-translate-x-1/2 before:bg-zinc-100 before:content-[''] dark:before:bg-zinc-800" />
  ),
  strong: ({ children }) => <strong className="font-base">{children}</strong>,
  img: (props: ImageProps) => (
    <Image
      sizes="100vw"
      style={{ width: '100%', height: 'auto' }}
      {...props}
      alt={props.alt ?? ''}
    />
  ),
  Link: (props: React.ComponentProps<typeof Link>) => <Link {...props} />,
  Callout,
  TableOfContents,
  MDXImage,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
