/**
 * NoroChatWelcome — shown when no session is active.
 * Displays a greeting and four quick-start suggestion cards.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { WELCOME_SUGGESTIONS } from './mockResponses';

interface NoroChatWelcomeProps {
  username?: string;
  onSuggestionClick: (text: string) => void;
}

const NoroChatWelcome: React.FC<NoroChatWelcomeProps> = ({ username, onSuggestionClick }) => {
  const firstName = username?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-7"
      >
        <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary-400 via-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30">
          <svg width="38" height="38" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4L18.8 11.2H26.4L20.8 15.6L22.8 23.2L16 18.8L9.2 23.2L11.2 15.6L5.6 11.2H13.2L16 4Z" fill="white" opacity="0.95" />
            <circle cx="16" cy="16" r="3" fill="white" opacity="0.55" />
          </svg>
        </div>
        <motion.div
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white dark:border-dark-bg-primary shadow-sm"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-1.5">
          <span className="bg-linear-to-r from-primary-600 via-primary-500 to-primary-700 bg-clip-text text-transparent">
            Hello, {firstName}!
          </span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-b-400 dark:text-dark-text-muted mb-8">
          I'm Noro — how can I help you today?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg"
      >
        {WELCOME_SUGGESTIONS.map((s, i) => (
          <motion.button
            key={i}
            id={`noro-suggestion-${i}`}
            onClick={() => onSuggestionClick(s.prompt)}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="group text-left p-4 rounded-2xl border border-neutral-w-300 dark:border-dark-border/50 bg-white dark:bg-dark-bg-secondary/70 hover:border-primary-400/70 dark:hover:border-primary-600/50 hover:shadow-md hover:shadow-primary-500/8 dark:hover:shadow-primary-500/5 transition-all duration-200 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200 inline-block">
                {s.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-b-800 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {s.title}
                </p>
                <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-0.5 line-clamp-1">
                  {s.subtitle}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default NoroChatWelcome;
