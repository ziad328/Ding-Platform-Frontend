import React from 'react';
import { Mail } from 'lucide-react';

interface EmptyMessageStateProps {
    onNewMessage?: () => void;
}

const EmptyMessageState: React.FC<EmptyMessageStateProps> = ({ onNewMessage }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-neutral-w-200 dark:bg-dark-bg-primary p-6">
            {/* Mail Icon */}
            <div className="mb-4">
                <Mail className="w-20 h-20 text-neutral-b-300 dark:text-dark-text-muted" strokeWidth={1.5} />
            </div>

            {/* Text */}
            <h2 className="text-xl font-semibold text-neutral-b-900 dark:text-dark-text-primary mb-2">
                Your messages
            </h2>
            <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted mb-6 text-center max-w-xs">
                Select a conversation to display messages or start a new chat.
            </p>

            {/* New Message Button */}
            <button
                onClick={onNewMessage}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
                Send message
            </button>
        </div>
    );
};

export default EmptyMessageState;
