import React from 'react';

export interface Conversation {
    id: string;
    name: string;
    username?: string;
    role?: string;
    avatar: string;
    lastMessage: string;
    timestamp?: string;
    lastActive?: string;
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
            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors rounded-xl ${isSelected
                ? 'bg-neutral-w-400 dark:bg-dark-bg-tertiary/70'
                : 'hover:bg-neutral-w-400/60 dark:hover:bg-dark-bg-tertiary/50'
                }`}
        >
            {/* Avatar with online status */}
            <div className="relative shrink-0">
                <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-14 h-14 rounded-full object-cover"
                />
                {conversation.isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-neutral-w-200 dark:border-dark-bg-primary rounded-full" />
                )}
            </div>

            {/* Content - Name, Last Message, and Timestamp */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">
                        {conversation.name}
                    </h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted truncate flex-1">
                        {conversation.lastActive ? `Active ${conversation.lastActive}` : conversation.lastMessage}
                    </p>
                    {conversation.timestamp && (
                        <>
                            <span className="text-sm text-neutral-b-400 dark:text-dark-text-muted shrink-0">·</span>
                            <span className="text-sm text-neutral-b-400 dark:text-dark-text-muted shrink-0">
                                {conversation.timestamp}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConversationItem;
