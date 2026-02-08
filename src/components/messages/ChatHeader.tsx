import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface ChatHeaderProps {
    name: string;
    avatar: string;
    isOnline?: boolean;
    lastActive?: string;
    onBack?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    name,
    avatar,
    isOnline,
    lastActive,
    onBack
}) => {
    const getActiveStatus = () => {
        if (isOnline) return 'Active now';
        if (lastActive) return `Active ${lastActive}`;
        return null;
    };

    const activeStatus = getActiveStatus();

    return (
        <div className="flex items-center gap-3 h-[60px] px-4 border-b border-neutral-w-400 dark:border-dark-border/40 bg-neutral-w-200 dark:bg-dark-bg-primary shrink-0">
            {/* Back button - mobile only */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="lg:hidden p-1.5 -ml-1.5 hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary/60 rounded-lg transition-colors"
                    aria-label="Back to conversations"
                >
                    <ArrowLeft className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                </button>
            )}

            {/* Avatar */}
            <div className="relative shrink-0">
                <img
                    src={avatar}
                    alt={name}
                    className="w-9 h-9 rounded-full object-cover"
                />
                {isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-neutral-w-200 dark:border-dark-bg-primary rounded-full" />
                )}
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">
                    {name}
                </h3>
                {activeStatus && (
                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                        {activeStatus}
                    </p>
                )}
            </div>

            {/* More options */}
            <button
                className="p-2 hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary/60 rounded-lg transition-colors"
                aria-label="More options"
            >
                <MoreVertical className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
            </button>
        </div>
    );
};

export default ChatHeader;
