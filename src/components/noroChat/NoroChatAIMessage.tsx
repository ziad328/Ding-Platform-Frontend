import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ── Quick action suggestion pills (inlined to avoid module resolution edge cases)
interface QuickActionsProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}
const NoroChatQuickActions: React.FC<QuickActionsProps> = ({ suggestions, onSuggestionClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, delay: 0.1 }}
    className="flex flex-wrap gap-2 mt-3"
  >
    {suggestions.map((s, i) => (
      <motion.button
        key={i}
        id={`noro-quick-action-${i}`}
        onClick={() => onSuggestionClick(s)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="text-xs px-3 py-1.5 rounded-full border border-neutral-w-400 dark:border-dark-border text-neutral-b-600 dark:text-dark-text-secondary hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-150 whitespace-nowrap"
      >
        {s}
      </motion.button>
    ))}
  </motion.div>
);

// ── Noro avatar icon ─────────────────────────────────────────
const NoroAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-primary-700 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
    <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 4L18.8 11.2H26.4L20.8 15.6L22.8 23.2L16 18.8L9.2 23.2L11.2 15.6L5.6 11.2H13.2L16 4Z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="16" cy="16" r="3" fill="white" opacity="0.6" />
    </svg>
  </div>
);

// ── Markdown component overrides ─────────────────────────────
const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary mt-4 mb-2">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-lg font-bold text-neutral-b-900 dark:text-dark-text-primary mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-base font-semibold text-neutral-b-800 dark:text-dark-text-primary mt-3 mb-1">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm leading-relaxed text-neutral-b-700 dark:text-dark-text-secondary mb-3 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-neutral-b-800 dark:text-dark-text-primary">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-neutral-b-700 dark:text-dark-text-secondary">{children}</em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1 mb-3 ml-2 text-sm text-neutral-b-700 dark:text-dark-text-secondary">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1 mb-3 ml-2 text-sm text-neutral-b-700 dark:text-dark-text-secondary">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
    inline ? (
      <code className="font-mono text-xs bg-neutral-w-300 dark:bg-dark-bg-tertiary text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded">
        {children}
      </code>
    ) : (
      <code className="block font-mono text-xs text-neutral-w-100 whitespace-pre-wrap">{children}</code>
    ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-neutral-b-800 dark:bg-neutral-b-900 rounded-xl p-4 mb-3 overflow-x-auto text-xs font-mono text-neutral-w-100">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-3 border-primary-400 pl-4 my-3 text-sm italic text-neutral-b-500 dark:text-dark-text-muted">
      {children}
    </blockquote>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  hr: () => <hr className="border-neutral-w-300 dark:border-dark-border my-3" />,
};

// ── Streaming renderer hook ───────────────────────────────────
function useStreamingText(fullText: string, isStreaming: boolean) {
  const [displayedText, setDisplayedText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedText(fullText);
      return;
    }

    setDisplayedText('');
    let index = 0;

    // Speed: ~20-40 chars per tick for a realistic feel
    const CHARS_PER_TICK = 6;
    const TICK_MS = 16; // ~60fps feel

    intervalRef.current = setInterval(() => {
      index += CHARS_PER_TICK;
      if (index >= fullText.length) {
        setDisplayedText(fullText);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedText(fullText.slice(0, index));
      }
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fullText, isStreaming]);

  return displayedText;
}

// ── Main AI message component ────────────────────────────────
interface NoroChatAIMessageProps {
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isLatest?: boolean;
  isStreaming?: boolean;
  onSuggestionClick?: (text: string) => void;
}

const NoroChatAIMessage: React.FC<NoroChatAIMessageProps> = ({
  content,
  timestamp,
  suggestions,
  isLatest,
  isStreaming = false,
  onSuggestionClick,
}) => {
  const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const displayedText = useStreamingText(content, isStreaming);
  const isDone = displayedText === content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-start gap-3 mb-4 sm:mb-6"
    >
      <NoroAvatar />

      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents as Record<string, React.ElementType>}
          >
            {displayedText}
          </ReactMarkdown>

          {/* Blinking cursor while streaming */}
          {isStreaming && !isDone && (
            <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse align-middle" />
          )}
        </div>

        <p className="text-[11px] text-neutral-b-300 dark:text-dark-text-muted mt-1 ml-0.5">
          {timeStr}
        </p>

        {/* Quick action pills — shown only when streaming is done on latest */}
        {isLatest && isDone && suggestions && suggestions.length > 0 && onSuggestionClick && (
          <NoroChatQuickActions
            suggestions={suggestions}
            onSuggestionClick={onSuggestionClick}
          />
        )}
      </div>
    </motion.div>
  );
};

export default NoroChatAIMessage;
