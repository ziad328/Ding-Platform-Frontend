/**
 * NoroChatInput — auto-resizing textarea with send/mic controls.
 * Supports Enter-to-send and Shift+Enter for new lines.
 */
import React, { useRef, useEffect, useState } from 'react';
import { Paperclip, Mic, ArrowUp, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoroChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const NoroChatInput: React.FC<NoroChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasText = value.trim().length > 0;

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 pb-1">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-w-200 dark:bg-dark-bg-secondary border border-neutral-w-400 dark:border-dark-border rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2.5 shadow-sm focus-within:border-primary-400 dark:focus-within:border-primary-600 focus-within:shadow-md transition-all duration-200">
          <button
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-neutral-b-300 dark:text-dark-text-muted hover:text-neutral-b-600 dark:hover:text-dark-text-secondary hover:bg-neutral-w-300/30 dark:hover:bg-dark-bg-secondary/40 transition-all shrink-0"
            title="Attach file"
            aria-label="Attach file"
            disabled={isLoading}
          >
            <Paperclip className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          <textarea
            ref={textareaRef}
            id="noro-message-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Noro…"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none text-[13px] sm:text-sm text-neutral-b-800 dark:text-dark-text-primary placeholder:text-neutral-b-400 dark:placeholder:text-dark-text-muted focus:outline-none disabled:opacity-50 leading-relaxed max-h-32 md:max-h-40 min-h-5 py-0.5"
          />

          <div className="flex items-center gap-1 shrink-0">
            <AnimatePresence mode="wait" initial={false}>
              {!hasText && (
                <motion.button
                  key="mic"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-neutral-b-300 dark:text-dark-text-muted hover:text-neutral-b-600 dark:hover:text-dark-text-secondary hover:bg-neutral-w-300/30 dark:hover:bg-dark-bg-secondary/40 transition-all shrink-0"
                  title="Voice input"
                  disabled={isLoading}
                >
                  <Mic className="w-4 h-4 sm:w-[17px] sm:h-[17px]" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              id="noro-send-btn"
              onClick={handleSend}
              disabled={!hasText || isLoading}
              whileTap={hasText && !isLoading ? { scale: 0.88 } : {}}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                hasText && !isLoading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm'
                  : 'bg-neutral-w-300 dark:bg-dark-bg-tertiary text-neutral-b-300 dark:text-dark-text-muted cursor-default'
              }`}
              aria-label="Send message"
            >
              <AnimatePresence mode="wait" initial={false}>
                {hasText ? (
                  <motion.span
                    key="send"
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 45 }}
                    transition={{ duration: 0.1 }}
                  >
                    <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-b-300 dark:text-dark-text-muted/60 text-center mt-2 pb-1 select-none">
          Noro can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default NoroChatInput;
