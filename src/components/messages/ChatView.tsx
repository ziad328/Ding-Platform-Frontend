import React, { useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import type { Message } from './MessageBubble';
import MessageInput from './MessageInput';
import type { Conversation } from './ConversationItem';

// Chat view displaying messages and input for a selected conversation

interface ChatViewProps {
    conversation: Conversation;
    messages: Message[];
    roomId: string;
    onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ conversation, messages, roomId, onBack }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const showProfileIntro = messages.length === 0;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="h-full flex flex-col bg-neutral-w-200 dark:bg-dark-bg-primary">
            <ChatHeader name={conversation.name} avatar={conversation.avatar} isOnline={conversation.isOnline} lastActive={conversation.lastActive} onBack={onBack} />

            <div className="flex-1 overflow-y-auto thin-scrollbar px-4 py-4">
                {showProfileIntro && (
                    <div className="flex flex-col items-center justify-center py-8 mb-4">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full p-1 bg-linear-to-tr from-primary-500 via-primary-400 to-primary-600">
                                <img src={conversation.avatar} alt={conversation.name} className="w-full h-full rounded-full object-cover border-4 border-neutral-w-200 dark:border-dark-bg-primary" />
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-neutral-b-900 dark:text-dark-text-primary mb-1">{conversation.name}</h2>
                        {conversation.username && <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">{conversation.username} · Instagram</p>}
                        {!conversation.username && conversation.role && <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">{conversation.role}</p>}
                    </div>
                )}

                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} senderName={conversation.name} />
                ))}

                <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0">
                <MessageInput roomId={roomId} />
            </div>
        </div>
    );
};

export default ChatView;
