import React from 'react';
import { WELCOME_SUGGESTIONS } from './mockResponses';

interface NoroChatWelcomeProps {
  username?: string;
  onSuggestionClick: (text: string) => void;
}

const NoroChatWelcome: React.FC<NoroChatWelcomeProps> = ({ username, onSuggestionClick }) => {
  const firstName = username?.split(' ')[0] || 'there';

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
      {/* Noro avatar / logo */}
      <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary-400 to-primary-700 flex items-center justify-center mb-6 shadow-lg">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4L18.8 11.2H26.4L20.8 15.6L22.8 23.2L16 18.8L9.2 23.2L11.2 15.6L5.6 11.2H13.2L16 4Z"
            fill="white" opacity="0.9" />
          <circle cx="16" cy="16" r="3" fill="white" opacity="0.6" />
        </svg>
      </div>

      {/* Greeting */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
        <span className="bg-linear-to-r from-primary-600 via-primary-400 to-primary-700 bg-clip-text text-transparent">
          Hello, {firstName}
        </span>
      </h1>
      <p className="text-base sm:text-lg text-neutral-b-400 dark:text-dark-text-muted mb-8 sm:mb-10">
        How can I help you today?
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {WELCOME_SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            id={`noro-suggestion-${i}`}
            onClick={() => onSuggestionClick(s.prompt)}
            className="group text-left p-4 rounded-2xl border border-neutral-w-400 dark:border-dark-border bg-white dark:bg-dark-bg-secondary hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-b-800 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {s.title}
                </p>
                <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted mt-0.5 line-clamp-1">
                  {s.subtitle}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NoroChatWelcome;
