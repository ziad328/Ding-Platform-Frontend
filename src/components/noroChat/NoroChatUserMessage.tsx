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
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex justify-end mb-4 sm:mb-6"
    >
      <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
        <div className="bg-neutral-w-300 dark:bg-dark-bg-tertiary px-4 py-3 rounded-2xl rounded-br-md">
          <p className="text-sm leading-relaxed text-neutral-b-800 dark:text-dark-text-primary whitespace-pre-wrap">
            {content}
          </p>
        </div>
        <p className="text-[11px] text-neutral-b-300 dark:text-dark-text-muted mt-1 text-right pr-1">
          {timeStr}
        </p>
      </div>
    </motion.div>
  );
};

export default NoroChatUserMessage;
