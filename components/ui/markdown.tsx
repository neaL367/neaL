import React from 'react';
import { CodeBlock } from '@/mdx-components';

interface MarkdownProps {
  content: string;
  className?: string;
}

function parseInline(text: string): React.ReactNode[] {
  // Regex to match:
  // 1. Links: [text](url)
  // 2. Bold: **text** or __text__
  // 3. Inline code: `code`
  // 4. Italic: *text* or _text_
  const regex = /(\[.*?\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*|__.*?__|`.*?`|\*.*?\*|_.*?_)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-zinc-400 hover:decoration-zinc-700 dark:hover:decoration-zinc-200 transition-colors font-medium text-inherit"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // Bold: **text** or __text__
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return (
        <strong key={index} className="font-semibold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          className="px-1 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-[11px] font-mono text-inherit"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic: *text* or _text_
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return (
        <em key={index} className="italic text-inherit">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
}

function splitMarkdownBlocks(content: string): string[] {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      currentBlock.push(line);
      continue;
    }

    if (inCodeBlock) {
      currentBlock.push(line);
      continue;
    }

    if (line.trim() === '') {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }

  return blocks;
}

export function Markdown({ content, className = '' }: MarkdownProps) {
  if (!content) return null;

  const blocks = splitMarkdownBlocks(content.trim());

  return (
    <div className={`space-y-2 text-inherit ${className}`}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);

        // Code block: ```lang ... ```
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const codeLines = trimmed.split('\n');
          const langMatch = codeLines[0].match(/^```([a-zA-Z0-9_-]+)?/);
          const language = langMatch && langMatch[1] ? langMatch[1] : 'typescript';
          const codeContent = codeLines.slice(1, -1).join('\n');
          return (
            <div key={bIdx} className="my-2 rounded-lg overflow-hidden text-xs">
              <CodeBlock className={`language-${language}`}>
                {codeContent}
              </CodeBlock>
            </div>
          );
        }

        // Table block: lines with |
        if (lines.length >= 2 && lines.every((l) => l.startsWith('|') && l.endsWith('|'))) {
          const headers = lines[0].split('|').map((s) => s.trim()).filter(Boolean);
          const hasSeparator = lines[1].includes('---');
          const rowLines = hasSeparator ? lines.slice(2) : lines.slice(1);

          return (
            <div key={bIdx} className="my-2 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-100/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
                    {headers.map((h, i) => (
                      <th key={i} className="p-2 font-semibold">
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rowLines.map((row, rIdx) => {
                    const cells = row.split('|').map((s) => s.trim()).filter(Boolean);
                    return (
                      <tr key={rIdx} className="border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-0">
                        {cells.map((c, cIdx) => (
                          <td key={cIdx} className="p-2">
                            {parseInline(c)}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Blockquote
        if (lines.length > 0 && lines.every((l) => l.startsWith('>'))) {
          return (
            <blockquote
              key={bIdx}
              className="border-l-2 border-zinc-300 dark:border-zinc-700 pl-3 my-1.5 italic text-zinc-600 dark:text-zinc-400"
            >
              {lines.map((l, lIdx) => (
                <p key={lIdx}>{parseInline(l.replace(/^>\s*/, ''))}</p>
              ))}
            </blockquote>
          );
        }

        // Bullet list block
        const isBulletList = lines.length > 0 && lines.every((l) => /^[*-]\s+/.test(l));
        if (isBulletList) {
          return (
            <ul key={bIdx} className="list-disc list-inside space-y-1 my-1 pl-1">
              {lines.map((l, lIdx) => (
                <li key={lIdx} className="leading-relaxed">
                  {parseInline(l.replace(/^[*-]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list block
        const isNumberedList = lines.length > 0 && lines.every((l) => /^\d+\.\s+/.test(l));
        if (isNumberedList) {
          return (
            <ol key={bIdx} className="list-decimal list-inside space-y-1 my-1 pl-1">
              {lines.map((l, lIdx) => (
                <li key={lIdx} className="leading-relaxed">
                  {parseInline(l.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={bIdx} className="font-semibold text-xs tracking-tight mt-2 mb-0.5">
              {parseInline(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          return (
            <h3 key={bIdx} className="font-semibold text-xs tracking-tight mt-2 mb-0.5">
              {parseInline(trimmed.replace(/^#{1,2}\s+/, ''))}
            </h3>
          );
        }

        // Regular paragraph with potential soft linebreaks
        return (
          <p key={bIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {parseInline(line)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
