/**
 * NoroChatThinkingIndicator — animated three-dot pulse shown while
 * Noro is processing a response. Rendered inside AnimatePresence.
 */
import React from 'react';
import { motion } from 'framer-motion';

const NoroAvatar = () => (
  <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary-400 to-primary-700 flex items-center justify-center shrink-0 shadow-md shadow-primary-500/25 mt-0.5">
    <svg width="15" height="15" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4L18.8 11.2H26.4L20.8 15.6L22.8 23.2L16 18.8L9.2 23.2L11.2 15.6L5.6 11.2H13.2L16 4Z" fill="white" opacity="0.95" />
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.5" />
    </svg>
  </div>
);

const NoroChatThinkingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.2 }}
    className="flex items-start gap-3 mb-5"
  >
    <NoroAvatar />
    <div className="bg-white dark:bg-dark-bg-secondary/80 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm border border-neutral-w-300/60 dark:border-dark-border/30">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-primary-400 dark:bg-primary-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

export default NoroChatThinkingIndicator;
