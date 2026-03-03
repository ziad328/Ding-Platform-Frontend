import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationList from '../../components/messages/ConversationList';
import ChatView from '../../components/messages/ChatView';
import EmptyMessageState from '../../components/messages/EmptyMessageState';
import NewMessageModal from '../../components/messages/NewMessageModal';
import { useGetRoomsQuery, useGetMessagesQuery } from '../../store/slices/chat';
import { addRoom, setCurrentRoom } from '../../store/slices/chat';
import type { RootState, AppDispatch } from '../../store/store';
import type { ChatRoom, ChatMessage } from '../../store/slices/chat/types';

// Main messaging page with conversation list and chat view

const transformRoomToConversation = (room: ChatRoom, currentUserId: string) => {
    const otherMember = room.type === 'DIRECT'
        ? room.members.find(m => m.userId !== currentUserId)
        : null;

    const lastMessage = room.messages?.[0];

    return {
        id: room.id,
        name: room.type === 'DIRECT'
            ? otherMember?.user.name || 'Unknown User'
            : room.name || 'Group Chat',
        username: otherMember?.user.email?.split('@')[0],
        avatar: otherMember?.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(
            room.type === 'DIRECT' ? otherMember?.user.name || 'U' : room.name || 'G'
        )}&background=random`,
        lastMessage: lastMessage?.content || '',
        timestamp: lastMessage ? formatTimestamp(lastMessage.createdAt) : '',
        lastActive: '',
        isOnline: false,
        type: room.type,
        members: room.members,
    };
};

const transformMessage = (msg: ChatMessage, currentUserId: string, senderAvatar?: string) => ({
    id: msg.id,
    content: msg.content,
    timestamp: formatTime(msg.createdAt),
    isSent: msg.userId === currentUserId,
    senderAvatar: msg.userId !== currentUserId ? senderAvatar : undefined,
    userId: msg.userId,
    roomId: msg.roomId,
    media: msg.media,
    createdAt: msg.createdAt,
});

const formatTimestamp = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) return 'now';
    if (diffHours < 24) return `${Math.floor(diffHours)}h`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d`;
    return date.toLocaleDateString();
};

const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessagesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [isMobileView, setIsMobileView] = useState(false);
    const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

    const currentUserId = useSelector((state: RootState) => state.auth.user?.id || '');
    const currentRoomId = useSelector((state: RootState) => state.chat.currentRoomId);

    const selectRoom = useCallback((roomId: string | null) => {
        dispatch(setCurrentRoom(roomId));
    }, [dispatch]);

    const { data: rooms = [], isLoading: roomsLoading } = useGetRoomsQuery();

    // Single source of truth: RTK Query cache.
    // Socket messages and sent messages are injected into this cache directly,
    // so this data is always live without any extra Redux state.
    const { data: rawMessages = [] } = useGetMessagesQuery(
        { roomId: currentRoomId! },
        {
            skip: !currentRoomId,
            refetchOnMountOrArgChange: true, // re-fetch when switching rooms
            refetchOnFocus: false,
            refetchOnReconnect: false,
            pollingInterval: 4000, // fallback: re-fetch every 4s until socket broadcast is fixed
        }
    );

    const conversations = rooms.map(room => transformRoomToConversation(room, currentUserId));
    const selectedConversation = conversations.find(c => c.id === currentRoomId);
    const currentRoom = rooms.find(r => r.id === currentRoomId);

    const getOtherUserAvatar = () => {
        if (!currentRoom) return undefined;
        const otherMember = currentRoom.members.find(m => m.userId !== currentUserId);
        return otherMember?.user.image || undefined;
    };

    const messages = rawMessages.map((msg: ChatMessage) =>
        transformMessage(msg, currentUserId, getOtherUserAvatar())
    );

    const handleSelectConversation = (id: string) => {
        selectRoom(id);
        setIsMobileView(true);
    };

    const handleBackToList = () => {
        setIsMobileView(false);
        setTimeout(() => {
            selectRoom(null);
        }, 50);
    };

    const handleNewMessage = () => {
        setIsNewMessageModalOpen(true);
    };

    const handleSelectPerson = (id: string) => {
        selectRoom(id);
        setIsMobileView(true);
        setIsNewMessageModalOpen(false);
    };

    const handleRoomCreated = (room: ChatRoom) => {
        dispatch(addRoom(room));
        selectRoom(room.id);
        setIsMobileView(true);
        setIsNewMessageModalOpen(false);
    };

    // Animation variants for mobile slide transitions
    const slideVariants = {
        enterFromRight: { x: '100%', opacity: 1 },
        enterFromLeft: { x: '-100%', opacity: 1 },
        center: { x: 0, opacity: 1 },
        exitToLeft: { x: '-100%', opacity: 1 },
        exitToRight: { x: '100%', opacity: 1 },
    };

    return (
        <div className="h-full overflow-hidden bg-neutral-w-200 dark:bg-dark-bg-primary flex flex-col">
            {/* Desktop: Two-column layout */}
            <div className="hidden lg:flex h-full">
                {/* Conversation List - Left Column */}
                <div className="w-80 xl:w-96 shrink-0 border-r border-neutral-w-400 dark:border-dark-border/40">
                    <ConversationList
                        conversations={conversations}
                        selectedId={currentRoomId}
                        onSelectConversation={handleSelectConversation}
                        onNewMessage={handleNewMessage}
                        isLoading={roomsLoading}
                    />
                </div>

                {/* Chat View or Empty State - Right Column */}
                <div className="flex-1 min-w-0">
                    {selectedConversation ? (
                        <ChatView
                            conversation={selectedConversation}
                            messages={messages}
                            roomId={currentRoomId!}
                        />
                    ) : (
                        <EmptyMessageState onNewMessage={handleNewMessage} />
                    )}
                </div>
            </div>

            {/* Mobile: Single view with slide transitions */}
            <div className="lg:hidden h-full relative overflow-hidden">
                <AnimatePresence initial={false} mode="popLayout">
                    {!isMobileView ? (
                        <motion.div
                            key="conversation-list"
                            initial="enterFromLeft"
                            animate="center"
                            exit="exitToLeft"
                            variants={slideVariants}
                            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
                            className="absolute inset-0"
                        >
                            <ConversationList
                                conversations={conversations}
                                selectedId={currentRoomId}
                                onSelectConversation={handleSelectConversation}
                                onNewMessage={handleNewMessage}
                                isLoading={roomsLoading}
                            />
                        </motion.div>
                    ) : selectedConversation ? (
                        <motion.div
                            key="chat-view"
                            initial="enterFromRight"
                            animate="center"
                            exit="exitToRight"
                            variants={slideVariants}
                            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
                            className="absolute inset-0"
                        >
                            <ChatView
                                conversation={selectedConversation}
                                messages={messages}
                                roomId={currentRoomId!}
                                onBack={handleBackToList}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* New Message Modal */}
            <NewMessageModal
                isOpen={isNewMessageModalOpen}
                onClose={() => setIsNewMessageModalOpen(false)}
                onSelectPerson={handleSelectPerson}
                onRoomCreated={handleRoomCreated}
            />
        </div>
    );
};

export default MessagesPage;
