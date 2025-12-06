import { useState } from 'react';
import ConversationList from '../../components/messages/ConversationList';
import ChatView from '../../components/messages/ChatView';
import EmptyMessageState from '../../components/messages/EmptyMessageState';
import NewMessageModal from '../../components/messages/NewMessageModal';
import type { Conversation } from '../../components/messages/ConversationItem';
import type { Message } from '../../components/messages/MessageBubble';

const MessagesPage = () => {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isMobileView, setIsMobileView] = useState(false);
    const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

    // Mock conversations data
    const conversations: Conversation[] = [
        {
            id: '1',
            name: 'Bessie Cooper',
            role: 'Marketing Manger',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
            lastMessage: "Hi, Robert. I'm facing some chall ...",
            isOnline: true,
        },
        {
            id: '2',
            name: 'Thomas Baker',
            role: 'Software Engineer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
            lastMessage: 'I have a job interview coming up ...',
            isOnline: false,
        },
        {
            id: '3',
            name: 'Daniel Brown',
            role: 'Product Designer',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
            lastMessage: 'Not much, just planning to relax ...',
            isOnline: false,
        },
        {
            id: '4',
            name: 'Ronald Richards',
            role: 'DevOps Engineer',
            avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
            lastMessage: "I'm stuck on the bug in the code ...",
            isOnline: false,
        },
    ];

    // Mock messages for selected conversation
    const mockMessages: Record<string, Message[]> = {
        '1': [
            {
                id: 'm1',
                content: "Hi, Robert. I'm facing some challenges in optimizing my code for performance. Can you help?",
                timestamp: '12:45 PM',
                isSent: false,
                senderAvatar: conversations[0].avatar,
            },
            {
                id: 'm2',
                content: "Hi, Bessie 👋 I'd be glad to help you with optimizing your code for better performance. To get started, could you provide me with some more details about the specific challenges you're facing?",
                timestamp: '12:55 PM',
                isSent: true,
            },
        ],
    };

    const selectedConversation = conversations.find((c) => c.id === selectedConversationId);
    const messages = selectedConversationId ? mockMessages[selectedConversationId] || [] : [];

    const handleSelectConversation = (id: string) => {
        setSelectedConversationId(id);
        setIsMobileView(true);
    };

    const handleBackToList = () => {
        setIsMobileView(false);
        setSelectedConversationId(null);
    };

    const handleNewMessage = () => {
        setIsNewMessageModalOpen(true);
    };

    const handleSelectPerson = (id: string) => {
        setSelectedConversationId(id);
        setIsMobileView(true);
    };

    const handleSendMessage = (message: string) => {
        console.log('Sending message:', message);
        // Here you would add the message to the conversation
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 mb-6 sm:mb-8 h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
            <div className="h-full bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
                {/* Desktop: Two-column layout */}
                <div className="hidden lg:grid lg:grid-cols-12 h-full">
                    {/* Conversation List - Left Column */}
                    <div className="lg:col-span-4 border-r border-neutral-w-400 dark:border-dark-border">
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversationId}
                            onSelectConversation={setSelectedConversationId}
                            onNewMessage={handleNewMessage}
                        />
                    </div>

                    {/* Chat View or Empty State - Right Column */}
                    <div className="lg:col-span-8">
                        {selectedConversation ? (
                            <ChatView
                                conversation={selectedConversation}
                                messages={messages}
                                onSendMessage={handleSendMessage}
                            />
                        ) : (
                            <EmptyMessageState onNewMessage={handleNewMessage} />
                        )}
                    </div>
                </div>

                {/* Mobile: Single view with conditional rendering */}
                <div className="lg:hidden h-full">
                    {!isMobileView || !selectedConversation ? (
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedConversationId}
                            onSelectConversation={handleSelectConversation}
                            onNewMessage={handleNewMessage}
                        />
                    ) : (
                        <ChatView
                            conversation={selectedConversation}
                            messages={messages}
                            onSendMessage={handleSendMessage}
                            onBack={handleBackToList}
                        />
                    )}
                </div>
            </div>

            {/* New Message Modal */}
            <NewMessageModal
                isOpen={isNewMessageModalOpen}
                onClose={() => setIsNewMessageModalOpen(false)}
                onSelectPerson={handleSelectPerson}
                availablePeople={conversations}
            />
        </div>
    );
};

export default MessagesPage;
