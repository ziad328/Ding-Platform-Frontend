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

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, senderName }) => {
    if (message.isSent) {
        // Sent message - right aligned, teal background
        return (
            <div className="flex justify-end mb-4 sm:mb-5">
                <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
                    <div className="bg-primary-600 dark:bg-primary-600 text-white px-4 py-3 sm:px-5 sm:py-4 rounded-2xl rounded-br-xs">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-1.5 text-right">
                        {message.timestamp}
                    </p>
                </div>
            </div>
        );
    }

    // Received message - left aligned with avatar and sender info
    return (
        <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-5">
            {/* Sender Avatar */}
            {message.senderAvatar && (
                <img
                    src={message.senderAvatar}
                    alt={senderName || 'Sender'}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
                />
            )}

            <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[65%]">
                {/* Sender Name */}
                {senderName && (
                    <div className="mb-1.5">
                        <span className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                            {senderName}
                        </span>
                    </div>
                )}

                {/* Message Content */}
                <div className="bg-neutral-w-200 dark:bg-dark-bg-tertiary text-neutral-b-900 dark:text-dark-text-primary px-4 py-3 sm:px-5 sm:py-4 rounded-2xl rounded-tl-xs">
                    <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-1.5">
                    {message.timestamp}
                </p>
            </div>
        </div>
    );
};

export default MessageBubble;
