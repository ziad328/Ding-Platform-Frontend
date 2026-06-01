/**
 * NoroChatUserMessage — right-aligned bubble for messages sent by the user.
 * Uses a subtle gradient bubble with a smooth entrance animation.
 */
import React from 'react';
import { motion } from 'framer-motion';

interface NoroChatUserMessageProps {
  content: string;
  timestamp: Date;
}

const NoroChatUserMessage: React.FC<NoroChatUserMessageProps> = ({ content, timestamp }) => {
  const timeStr = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="flex justify-end mb-5 sm:mb-6"
    >
      <div className="max-w-[80%] sm:max-w-[72%] md:max-w-[62%]">
        <div className="relative bg-linear-to-br from-primary-600 to-primary-700 dark:from-primary-600 dark:to-primary-800 px-4 py-3 rounded-2xl rounded-br-sm shadow-sm shadow-primary-500/20">
          <p className="text-sm leading-relaxed text-white whitespace-pre-wrap font-[450]">
            {content}
          </p>
        </div>
        <p className="text-[11px] text-neutral-b-300 dark:text-dark-text-muted mt-1 text-right pr-1 select-none">
          {timeStr}
        </p>
      </div>
    </motion.div>
  );
};

export default NoroChatUserMessage;
