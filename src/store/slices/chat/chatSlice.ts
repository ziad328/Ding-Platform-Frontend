import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatRoom, ChatMessage } from './types';

// Redux slice for managing chat rooms, messages, and real-time state

const initialState: ChatState = {
    rooms: [],
    currentRoomId: null,
    messages: {},
    typingUsers: {},
    loading: false,
    error: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setRooms: (state, action: PayloadAction<ChatRoom[]>) => {
            state.rooms = action.payload;
            state.loading = false;
        },

        addRoom: (state, action: PayloadAction<ChatRoom>) => {
            const exists = state.rooms.some(r => r.id === action.payload.id);
            if (!exists) {
                state.rooms.unshift(action.payload);
            }
        },

        setCurrentRoom: (state, action: PayloadAction<string | null>) => {
            state.currentRoomId = action.payload;
        },

        setMessages: (state, action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>) => {
            state.messages[action.payload.roomId] = action.payload.messages;
        },

        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            const message = action.payload;
            const roomId = message.roomId;

            if (!state.messages[roomId]) {
                state.messages[roomId] = [];
            }

            const exists = state.messages[roomId].some(m => m.id === message.id);
            if (!exists) {
                state.messages[roomId].push(message);
            }

            const roomIndex = state.rooms.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                state.rooms[roomIndex].messages = [message];
                state.rooms[roomIndex].updatedAt = message.createdAt;

                state.rooms.sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
            }
        },

        prependMessages: (state, action: PayloadAction<{ roomId: string; messages: ChatMessage[] }>) => {
            const { roomId, messages } = action.payload;
            if (!state.messages[roomId]) {
                state.messages[roomId] = [];
            }
            state.messages[roomId] = [...messages, ...state.messages[roomId]];
        },

        setTypingUser: (state, action: PayloadAction<{ roomId: string; userId: string; isTyping: boolean }>) => {
            const { roomId, userId, isTyping } = action.payload;
            if (!state.typingUsers[roomId]) {
                state.typingUsers[roomId] = [];
            }
            if (isTyping && !state.typingUsers[roomId].includes(userId)) {
                state.typingUsers[roomId].push(userId);
            } else if (!isTyping) {
                state.typingUsers[roomId] = state.typingUsers[roomId].filter(id => id !== userId);
            }
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },

        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },

        clearChatData: (state) => {
            state.rooms = [];
            state.currentRoomId = null;
            state.messages = {};
            state.typingUsers = {};
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    setRooms,
    addRoom,
    setCurrentRoom,
    setMessages,
    addMessage,
    prependMessages,
    setTypingUser,
    setLoading,
    setError,
    clearChatData,
} = chatSlice.actions;

export default chatSlice.reducer;
