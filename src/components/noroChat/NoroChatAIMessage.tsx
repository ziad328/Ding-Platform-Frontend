/**
 * NoroChatAIMessage — left-aligned Noro response with markdown rendering,
 * client-side streaming animation, and optional follow-up suggestion pills.
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NoroAvatar = () => (
  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary-400 to-primary-700 flex items-center justify-center shrink-0 shadow-md shadow-primary-500/25 mt-0.5">
    <svg width="15" height="15" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L18.8 11.2H26.4L20.8 15.6L22.8 23.2L16 18.8L9.2 23.2L11.2 15.6L5.6 11.2H13.2L16 4Z" fill="white" opacity="0.95" />
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.5" />
    </svg>
  </div>
);

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
    <p className="text-[13.5px] leading-relaxed text-neutral-b-700 dark:text-dark-text-secondary mb-3 last:mb-0">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-neutral-b-800 dark:text-dark-text-primary">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic text-neutral-b-700 dark:text-dark-text-secondary">{children}</em>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc list-inside space-y-1 mb-3 ml-2 text-[13.5px] text-neutral-b-700 dark:text-dark-text-secondary">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1 mb-3 ml-2 text-[13.5px] text-neutral-b-700 dark:text-dark-text-secondary">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
    inline ? (
      <code className="font-mono text-label bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300 px-1.5 py-0.5 rounded-md border border-primary-200/50 dark:border-primary-700/30">
        {children}
      </code>
    ) : (
      <code className="block font-mono text-xs text-neutral-w-100 whitespace-pre-wrap">{children}</code>
    ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="bg-neutral-b-800 dark:bg-[#0d1117] rounded-xl p-4 mb-3 overflow-x-auto text-xs font-mono text-neutral-w-100 border border-neutral-b-700/50 shadow-inner">
      {children}
    </pre>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-primary-400 pl-4 my-3 text-[13px] italic text-neutral-b-500 dark:text-dark-text-muted bg-primary-50/40 dark:bg-primary-900/10 py-1 rounded-r-lg">
      {children}
    </blockquote>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} className="text-primary-600 dark:text-primary-400 underline decoration-primary-300 dark:decoration-primary-700 underline-offset-2 hover:text-primary-700 hover:decoration-primary-500 transition-colors" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  hr: () => <hr className="border-neutral-w-300 dark:border-dark-border/40 my-3" />,
};

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
    const CHARS_PER_TICK = 6;
    const TICK_MS = 16;
    intervalRef.current = setInterval(() => {
      index += CHARS_PER_TICK;
      if (index >= fullText.length) {
        setDisplayedText(fullText);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayedText(fullText.slice(0, index));
      }
    }, TICK_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fullText, isStreaming]);

  return displayedText;
}

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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex items-start gap-3 mb-5 sm:mb-7"
    >
      <NoroAvatar />

      <div className="flex-1 min-w-0">
        <div className="bg-white dark:bg-dark-bg-secondary/80 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm border border-neutral-w-300/60 dark:border-dark-border/30">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents as Record<string, React.ElementType>}
            >
              {displayedText}
            </ReactMarkdown>

            {isStreaming && !isDone && (
              <span className="inline-block w-0.5 h-4 bg-primary-500 ml-0.5 animate-pulse align-middle rounded-full" />
            )}
          </div>
        </div>

        <p className="text-[11px] text-neutral-b-300 dark:text-dark-text-muted mt-1.5 ml-1 select-none">
          {timeStr}
        </p>

        {isLatest && isDone && suggestions && suggestions.length > 0 && onSuggestionClick && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.12 }}
            className="flex flex-wrap gap-2 mt-3"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                id={`noro-quick-action-${i}`}
                onClick={() => onSuggestionClick(s)}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="text-xs px-3 py-1.5 rounded-full border border-neutral-w-400 dark:border-dark-border text-neutral-b-600 dark:text-dark-text-secondary hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-sm transition-all duration-150 whitespace-nowrap"
              >
                {s}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default NoroChatAIMessage;
