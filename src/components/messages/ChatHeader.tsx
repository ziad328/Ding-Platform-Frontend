import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
    name: string;
    role: string;
    avatar: string;
    isOnline?: boolean;
    onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    name,
    avatar,
    isOnline,
    onBack
}) => {
    return (
        <div className="flex items-center gap-2 sm:gap-3 h-[60px] sm:h-[68px] px-3 sm:px-4 border-b border-neutral-w-400 dark:border-dark-border bg-white dark:bg-dark-bg-secondary">
            {/* Back button - mobile only */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="lg:hidden p-1.5 sm:p-2 -ml-1 sm:-ml-2 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                    aria-label="Back to conversations"
                >
                    <ArrowLeft className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                </button>
            )}

            {/* Avatar with online status */}
            <div className="relative shrink-0">
                <img
                    src={avatar}
                    alt={name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                />
                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white dark:border-dark-bg-secondary rounded-full" />
                )}
            </div>

            {/* User info - name and online status on same baseline */}
            <div className="flex-1 min-w-0 flex items-baseline gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">
                    {name}
                </h3>
                {isOnline && (
                    <span className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 shrink-0">
                        • Online
                    </span>
                )}
            </div>

            {/* More options */}
            <button
                className="p-1.5 sm:p-2 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                aria-label="More options"
            >
                <MoreVertical className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
            </button>
        </div>
    );
};

export default ChatHeader;
