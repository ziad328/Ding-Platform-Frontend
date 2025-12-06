import React from 'react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import type { Message } from './MessageBubble';
import MessageInput from './MessageInput';
import type { Conversation } from './ConversationItem';

interface ChatViewProps {
    conversation: Conversation;
    messages: Message[];
    onSendMessage?: (message: string) => void;
    onBack?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    conversation,
    messages,
    onSendMessage,
    onBack,
}) => {
    return (
        <div className="h-full flex flex-col bg-white dark:bg-dark-bg-secondary">
            {/* Chat Header */}
            <ChatHeader
                name={conversation.name}
                role={conversation.role}
                avatar={conversation.avatar}
                isOnline={conversation.isOnline}
                onBack={onBack}
            />

            {/* Messages Area - Same padding as ChatHeader */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
            </div>

            {/* Message Input */}
            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};

export default ChatView;
