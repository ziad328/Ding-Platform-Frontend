import React from 'react';

export interface Message {
    id: string;
    content: string;
    timestamp: string;
    isSent: boolean;
    senderAvatar?: string;
}

interface MessageBubbleProps {
    message: Message;
    senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    if (message.isSent) {
        // Sent message - right aligned, primary color background
        return (
            <div className="flex justify-end mb-3">
                <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
                    <div className="bg-primary-600 text-white px-4 py-2.5 rounded-2xl rounded-br-sm">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-1 text-right">
                        {message.timestamp}
                    </p>
                </div>
            </div>
        );
    }

    // Received message - left aligned with small avatar
    return (
        <div className="flex items-center gap-2 mb-3">
            {/* Small Avatar */}
            {message.senderAvatar && (
                <img
                    src={message.senderAvatar}
                    alt="Sender"
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                />
            )}

            <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
                {/* Message Content - visible background for light mode */}
                <div className="bg-neutral-w-400 dark:bg-dark-bg-tertiary text-neutral-b-900 dark:text-dark-text-primary px-4 py-2.5 rounded-2xl rounded-bl-sm">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-1">
                    {message.timestamp}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
