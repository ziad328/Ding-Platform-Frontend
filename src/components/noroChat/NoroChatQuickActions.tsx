import React from 'react';
import { motion } from 'framer-motion';

interface NoroChatQuickActionsProps {
  suggestions: string[];
  onSuggestionClick: (text: string) => void;
}

const NoroChatQuickActions: React.FC<NoroChatQuickActionsProps> = ({ suggestions, onSuggestionClick }) => (
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

export default NoroChatQuickActions;
