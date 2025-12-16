import React from 'react';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import type { Conversation } from './ConversationItem';

interface MessageHeaderProps {
    selectedConversation?: Conversation | null;
    onBack?: () => void;
    showMobileBack?: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
    selectedConversation,
    onBack,
    showMobileBack = false,
}) => {
    return (
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-neutral-w-400 dark:border-dark-border bg-white dark:bg-dark-bg-secondary">
            {/* Left side - Messages title or Back button on mobile */}
            <div className="flex items-center gap-3">
                {showMobileBack && onBack && (
                    <button
                        onClick={onBack}
                        className="lg:hidden p-1.5 -ml-1.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                    </button>
                )}
                <h1 className="text-lg sm:text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary">
                    Messages
                </h1>
            </div>

            {/* Right side - Online status and menu (only when conversation selected) */}
            {selectedConversation && (
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Online badge */}
                    {selectedConversation.isOnline && (
                        <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-full">
                            Online
                        </span>
                    )}

                    {/* More options button */}
                    <button
                        className="p-1.5 sm:p-2 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                        aria-label="More options"
                    >
                        <MoreHorizontal className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MessageHeader;
