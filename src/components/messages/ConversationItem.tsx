import React from 'react';
import type { ChatMember } from '../../store/slices/chat/types';

// Single conversation item in the chat list

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
    type?: 'DIRECT' | 'GROUP';
    members?: ChatMember[];
}

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${isSelected ? 'bg-primary-50 dark:bg-primary-500/10' : 'hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary/60'}`}
        >
            <div className="relative shrink-0">
                <img src={conversation.avatar} alt={conversation.name} className="w-12 h-12 rounded-full object-cover" />
                {conversation.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-neutral-w-200 dark:border-dark-bg-primary" />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-neutral-b-900 dark:text-dark-text-primary'}`}>{conversation.name}</h3>
                    {conversation.timestamp && <span className="text-xs text-neutral-b-400 dark:text-dark-text-muted shrink-0">{conversation.timestamp}</span>}
                </div>
                <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted truncate">{conversation.lastMessage}</p>
            </div>
        </button>
    );
};

export default ConversationItem;
