import React from 'react';
import { motion } from 'framer-motion';

// Noro avatar (shared with NoroChatAIMessage)
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

const NoroChatThinkingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.2 }}
    className="flex items-start gap-3 mb-4 sm:mb-6"
  >
    <NoroAvatar />
    <div className="flex items-center gap-1.5 h-8 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary-400 dark:bg-primary-500"
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  </motion.div>
);

export default NoroChatThinkingIndicator;
