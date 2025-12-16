import React from 'react';
import { Edit } from 'lucide-react';
import ConversationItem from './ConversationItem';
import type { Conversation } from './ConversationItem';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelectConversation: (id: string) => void;
    onNewMessage?: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversations,
    selectedId,
    onSelectConversation,
    onNewMessage,
}) => {
    return (
        <div className="h-full flex flex-col bg-white dark:bg-dark-bg-secondary">
            {/* Conversation List - takes remaining space */}
            <div className="flex-1 overflow-y-auto">
                {conversations.map((conversation) => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isSelected={selectedId === conversation.id}
                        onClick={() => onSelectConversation(conversation.id)}
                    />
                ))}
            </div>

            {/* New Message Button - integrated with border-top only, no padding, no button border */}
            <button
                onClick={onNewMessage}
                className="flex items-center justify-center gap-2 py-3 sm:py-4 text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary border-t border-neutral-w-400 dark:border-dark-border hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            >
                <Edit className="w-4 h-4" />
                New Message
            </button>
        </div>
    );
};

export default ConversationList;
