import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, ChatRoom, ChatMessage } from './types';

// Redux slice — only owns rooms, currentRoomId, and typingUsers.
// Messages are owned exclusively by the RTK Query cache (useGetMessagesQuery).

const initialState: ChatState = {
    rooms: [],
    currentRoomId: null,
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

        // Called when a socket message arrives — updates the room's last-message
        // preview and re-sorts the room list. The message itself lives in the RTK cache.
        updateRoomLastMessage: (state, action: PayloadAction<ChatMessage>) => {
            const { roomId } = action.payload;
            const roomIndex = state.rooms.findIndex(r => r.id === roomId);
            if (roomIndex !== -1) {
                state.rooms[roomIndex].messages = [action.payload];
                state.rooms[roomIndex].updatedAt = action.payload.createdAt;
                state.rooms.sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
            }
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
    updateRoomLastMessage,
    setTypingUser,
    setLoading,
    setError,
    clearChatData,
} = chatSlice.actions;

export default chatSlice.reducer;
