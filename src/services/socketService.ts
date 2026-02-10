import { io, Socket } from 'socket.io-client';
import type { ChatMessage } from '../store/slices/chat/types';

// WebSocket service singleton for real-time chat with Socket.io

type MessageCallback = (message: ChatMessage) => void;
type UserEventCallback = (data: { userId: string; userName: string }) => void;
type TypingCallback = (data: { userId: string; isTyping: boolean }) => void;
type ErrorCallback = (error: string) => void;

let socket: Socket | null = null;
let messageCallback: MessageCallback | null = null;
let userJoinedCallback: UserEventCallback | null = null;
let userLeftCallback: UserEventCallback | null = null;
let typingCallback: TypingCallback | null = null;
let errorCallback: ErrorCallback | null = null;

const getSocketUrl = (): string => {
    const baseUrl = import.meta.env.VITE_BASE_BACK_URL as string;
    return baseUrl.replace(/^http/, 'ws').replace(/\/api\/v1$/, '');
};

export const initializeSocket = (token: string): Socket => {
    if (socket?.connected) {
        console.log('Socket already connected');
        return socket;
    }

    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
    }

    const socketUrl = getSocketUrl();
    console.log('🔌 Connecting to socket:', `${socketUrl}/chat`);

    socket = io(`${socketUrl}/chat`, {
        transports: ['websocket'],
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
        console.log('✅ Connected to chat server, socket ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        errorCallback?.(`Connection failed: ${error.message}`);
    });

    socket.on('joinedRoom', (roomId: string) => {
        console.log(`✅ Joined room: ${roomId}`);
    });

    socket.on('leftRoom', (roomId: string) => {
        console.log(`👋 Left room: ${roomId}`);
    });

    socket.on('newMessage', (message: ChatMessage) => {
        console.log('📨 New message received:', message);
        if (messageCallback) {
            messageCallback(message);
        } else {
            console.warn('No message callback registered');
        }
    });

    socket.on('userJoined', (data: { userId: string; userName: string }) => {
        console.log('👤 User joined:', data);
        userJoinedCallback?.(data);
    });

    socket.on('userLeft', (data: { userId: string; userName: string }) => {
        console.log('👤 User left:', data);
        userLeftCallback?.(data);
    });

    socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
        typingCallback?.(data);
    });

    socket.on('error', (error: string) => {
        console.error('Socket error:', error);
        errorCallback?.(error);
    });

    return socket;
};

export const getSocket = (): Socket | null => socket;
export const isSocketConnected = (): boolean => socket?.connected ?? false;

export const joinRoom = (roomId: string): void => {
    if (!socket?.connected) {
        console.warn('Cannot join room - socket not connected');
        return;
    }
    console.log('📍 Joining room:', roomId);
    socket.emit('joinRoom', { roomId });
};

export const leaveRoom = (roomId: string): void => {
    if (!socket?.connected) return;
    socket.emit('leaveRoom', { roomId });
};

export const emitTyping = (roomId: string, isTyping: boolean): void => {
    if (!socket?.connected) return;
    socket.emit('typing', { roomId, isTyping });
};

export const onNewMessage = (callback: MessageCallback): void => {
    console.log('📝 Registering message callback');
    messageCallback = callback;
};

export const onUserJoined = (callback: UserEventCallback): void => {
    userJoinedCallback = callback;
};

export const onUserLeft = (callback: UserEventCallback): void => {
    userLeftCallback = callback;
};

export const onTyping = (callback: TypingCallback): void => {
    typingCallback = callback;
};

export const onError = (callback: ErrorCallback): void => {
    errorCallback = callback;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
    messageCallback = null;
    userJoinedCallback = null;
    userLeftCallback = null;
    typingCallback = null;
    errorCallback = null;
};
