import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
    onSendMessage?: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && onSendMessage) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-3 sm:p-4 border-t border-neutral-w-400 dark:border-dark-border bg-white dark:bg-dark-bg-secondary">
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Input */}
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message ..."
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-2.5 bg-neutral-w-100 dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg text-sm text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-shadow"
                />

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="p-2 sm:p-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    aria-label="Send message"
                >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
