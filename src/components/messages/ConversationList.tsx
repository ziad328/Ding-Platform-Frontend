import React, { useState } from 'react';
import { Search, SquarePen } from 'lucide-react';
import ConversationItem from './ConversationItem';
import type { Conversation } from './ConversationItem';

// Searchable list of chat conversations with tabs

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelectConversation: (id: string) => void;
    onNewMessage?: () => void;
    isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, selectedId, onSelectConversation, onNewMessage, isLoading = false }) => {
    const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConversations = conversations.filter((conv) => conv.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="h-full flex flex-col gap-3 bg-neutral-w-200 dark:bg-dark-bg-primary p-4">
            <div className="flex items-center justify-between shrink-0">
                <h1 className="text-xl font-bold text-neutral-b-900 dark:text-dark-text-primary">Messages</h1>
                <button onClick={onNewMessage} className="p-2 hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary/60 rounded-lg transition-colors" aria-label="New message">
                    <SquarePen className="w-6 h-6 text-neutral-b-700 dark:text-dark-text-primary" />
                </button>
            </div>

            <div className="relative shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-b-400 dark:text-dark-text-muted" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search" className="w-full pl-10 pr-4 py-2.5 bg-neutral-w-300 dark:bg-dark-bg-tertiary/50 border-0 rounded-xl text-sm text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-400 transition-shadow" />
            </div>

            <div className="flex shrink-0 bg-neutral-w-300 dark:bg-dark-bg-secondary rounded-xl p-1">
                <button onClick={() => setActiveTab('messages')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'messages' ? 'bg-white dark:bg-dark-bg-tertiary text-neutral-b-900 dark:text-dark-text-primary shadow-sm' : 'text-neutral-b-600 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-secondary'}`}>Messages</button>
                <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-dark-bg-tertiary text-neutral-b-900 dark:text-dark-text-primary shadow-sm' : 'text-neutral-b-600 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-secondary'}`}>Requests</button>
            </div>

            <div className="flex-1 overflow-y-auto thin-scrollbar -mx-4 px-2">
                {isLoading ? (
                    <div className="flex flex-col gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                                <div className="w-12 h-12 rounded-full bg-neutral-w-400/50 dark:bg-dark-bg-tertiary shrink-0" />
                                <div className="flex-1">
                                    <div className="h-4 w-24 bg-neutral-w-400/50 dark:bg-dark-bg-tertiary rounded mb-2" />
                                    <div className="h-3 w-32 bg-neutral-w-400/30 dark:bg-dark-bg-tertiary/60 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'messages' ? (
                    filteredConversations.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {filteredConversations.map((conversation) => (
                                <ConversationItem key={conversation.id} conversation={conversation} isSelected={selectedId === conversation.id} onClick={() => onSelectConversation(conversation.id)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-32 text-sm text-neutral-b-500 dark:text-dark-text-muted">No conversations found</div>
                    )
                ) : (
                    <div className="flex items-center justify-center h-32 text-sm text-neutral-b-500 dark:text-dark-text-muted">No message requests</div>
                )}
            </div>
        </div>
    );
};

export default ConversationList;
