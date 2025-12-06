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
            {/* Header - Fixed height to match ChatHeader */}
            <div className="flex items-center h-[60px] sm:h-[68px] px-3 sm:px-4 border-b border-neutral-w-400 dark:border-dark-border">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary">
                    Messages
                </h2>
            </div>

            {/* Conversation List */}
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

            {/* New Message Button */}
            <div className="p-3 sm:p-4 border-t border-neutral-w-400 dark:border-dark-border">
                <button
                    onClick={onNewMessage}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-neutral-b-700 dark:text-dark-text-secondary bg-white dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    New Message
                </button>
            </div>
        </div>
    );
};

export default ConversationList;
