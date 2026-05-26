import React, { useRef, useEffect, useCallback, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import type { NoroChatConversation } from './types';
import NoroChatWelcome from './NoroChatWelcome';
import NoroChatUserMessage from './NoroChatUserMessage';
import NoroChatAIMessage from './NoroChatAIMessage';
import NoroChatThinkingIndicator from './NoroChatThinkingIndicator';
import NoroChatInput from './NoroChatInput';

interface NoroChatMainProps {
  conversation: NoroChatConversation | null;
  isLoading: boolean;
  streamingMessageId: string | null;
  onSendMessage: (text: string) => void;
  onSuggestionClick: (text: string) => void;
  onOpenSidebar: () => void;
  username?: string;
}

const NoroChatMain: React.FC<NoroChatMainProps> = ({
  conversation,
  isLoading,
  streamingMessageId,
  onSendMessage,
  onSuggestionClick,
  onOpenSidebar,
  username,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const prevConversationId = useRef<string | null>(null);

  // Detect if user manually scrolled up
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    // If more than 100px from bottom, consider user scrolled up
    setUserScrolledUp(distanceFromBottom > 100);
  }, []);

  // On conversation switch → always scroll to bottom
  useEffect(() => {
    if (conversation?.id !== prevConversationId.current) {
      prevConversationId.current = conversation?.id ?? null;
      setUserScrolledUp(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [conversation?.id]);

  // On new message — scroll only if user is near the bottom
  useEffect(() => {
    if (!userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages.length, isLoading, userScrolledUp]);

  const messages = conversation?.messages ?? [];
  const lastMsg = messages[messages.length - 1];

  return (
    <div className="flex flex-col flex-1 h-full min-w-0 bg-neutral-w-200 dark:bg-dark-bg-primary">
      {/* ── Mobile header (hamburger) ───────────────── */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-neutral-w-200 dark:bg-dark-bg-primary border-b border-neutral-w-400 dark:border-dark-border/40 shrink-0">
        <button
          id="noro-sidebar-toggle"
          onClick={onOpenSidebar}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-b-500 dark:text-dark-text-muted hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary transition-all"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-linear-to-br from-primary-400 to-primary-700 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L18.8 11.2H26.4L20.8 15.6L22.8 23.2L16 18.8L9.2 23.2L11.2 15.6L5.6 11.2H13.2L16 4Z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-neutral-b-800 dark:text-dark-text-primary">Noro</span>
        </div>
      </div>

      {/* ── Messages or Welcome ─────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto thin-scrollbar"
      >
        {!conversation ? (
          <NoroChatWelcome
            username={username}
            onSuggestionClick={onSuggestionClick}
          />
        ) : (
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => {
                const isLatest = idx === messages.length - 1;
                const isStreaming = msg.id === streamingMessageId;

                return msg.role === 'user' ? (
                  <NoroChatUserMessage
                    key={msg.id}
                    content={msg.content}
                    timestamp={msg.timestamp}
                  />
                ) : (
                  <NoroChatAIMessage
                    key={msg.id}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    suggestions={msg.suggestions}
                    isLatest={isLatest}
                    isStreaming={isStreaming}
                    onSuggestionClick={onSuggestionClick}
                  />
                );
              })}
            </AnimatePresence>

            {/* Thinking indicator */}
            <AnimatePresence>
              {isLoading && lastMsg?.role === 'user' && (
                <NoroChatThinkingIndicator key="thinking" />
              )}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* ── Input bar ──────────────────────────────── */}
      <div className="shrink-0 pb-safe bg-neutral-w-200 dark:bg-dark-bg-primary pt-2">
        <NoroChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default NoroChatMain;
