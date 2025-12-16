import React from 'react';

export interface Conversation {
    id: string;
    name: string;
    role: string;
    avatar: string;
    lastMessage: string;
    isOnline?: boolean;
}

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    isSelected,
    onClick
}) => {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 cursor-pointer transition-colors ${isSelected
                ? 'bg-neutral-w-200 dark:bg-dark-bg-tertiary'
                : 'hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary'
                }`}
        >
            {/* Avatar with online status */}
            <div className="relative shrink-0">
                <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white dark:border-dark-bg-secondary rounded-full" />
                )}
            </div>

            {/* Content - Name and Last Message centered */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-sm sm:text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">
                    {conversation.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-b-600 dark:text-dark-text-secondary truncate">
                    {conversation.lastMessage}
                </p>
            </div>
        </div>
    );
};

export default ConversationItem;
