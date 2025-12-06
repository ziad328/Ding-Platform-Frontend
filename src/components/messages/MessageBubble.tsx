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
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    if (message.isSent) {
        // Sent message - right aligned, teal background
        return (
            <div className="flex justify-end mb-3 sm:mb-4">
                <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                    <div className="bg-primary-600 dark:bg-primary-600 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-br-md">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-1 text-right">
                        {message.timestamp}
                    </p>
                </div>
            </div>
        );
    }

    // Received message - left aligned, light background
    return (
        <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* Sender Avatar */}
            {message.senderAvatar && (
                <img
                    src={message.senderAvatar}
                    alt="Sender"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
                />
            )}

            <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%]">
                <div className="bg-neutral-w-200 dark:bg-dark-bg-tertiary text-neutral-b-900 dark:text-dark-text-primary px-3 py-2 sm:px-4 sm:py-3 rounded-2xl rounded-tl-md">
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
