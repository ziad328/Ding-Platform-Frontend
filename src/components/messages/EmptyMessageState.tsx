import React from 'react';
import { Mail } from 'lucide-react';

interface EmptyMessageStateProps {
    onNewMessage?: () => void;
}

const EmptyMessageState: React.FC<EmptyMessageStateProps> = ({ onNewMessage }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-dark-bg-secondary p-6 sm:p-8">
            {/* Mail Icon */}
            <div className="mb-3 sm:mb-4">
                <Mail className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-neutral-b-300 dark:text-dark-text-muted" strokeWidth={1.5} />
            </div>

            {/* Text */}
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-b-900 dark:text-dark-text-primary mb-1.5 sm:mb-2">
                Your messages
            </h2>
            <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted mb-4 sm:mb-6 text-center max-w-xs">
                Select a person to display their chat or start a new conversation.
            </p>

            {/* New Message Button */}
            <button
                onClick={onNewMessage}
                className="px-5 py-2 sm:px-6 sm:py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
                New message
            </button>
        </div>
    );
};

export default EmptyMessageState;
