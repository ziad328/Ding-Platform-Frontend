import React from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from './MessageBubble';
import MessageInput from './MessageInput';
import type { Conversation } from './ConversationItem';

interface ChatViewProps {
    conversation: Conversation;
    messages: Message[];
    onSendMessage?: (message: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    conversation,
    messages,
    onSendMessage,
}) => {
    return (
        <div className="h-full flex flex-col bg-white dark:bg-dark-bg-secondary">
            {/* Messages Area - Seamless, takes remaining space */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        senderName={conversation.name}
                    />
                ))}
            </div>

            {/* Message Input - No top border, seamless with chat */}
            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};

export default ChatView;
