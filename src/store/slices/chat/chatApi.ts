import { apiSlice } from '../../ApiSlice';
import type { ChatRoom, ChatMessage, CreateRoomRequest } from './types';

// RTK Query endpoints for chat rooms and messages API

export const chatApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRooms: builder.query<ChatRoom[], void>({
            query: () => '/chat/rooms',
            providesTags: ['Rooms'],
            transformResponse: (response: ChatRoom[] | { data: ChatRoom[] }) => {
                const rooms = Array.isArray(response) ? response : response.data;
                return rooms.sort((a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
            },
        }),

        getMessages: builder.query<ChatMessage[], { roomId: string; cursor?: string }>({
            query: ({ roomId, cursor }) => ({
                url: `/chat/rooms/${roomId}/messages`,
                params: cursor ? { cursor } : undefined,
            }),
            providesTags: (_result, _error, { roomId }) => [{ type: 'Messages', id: roomId }],
            transformResponse: (response: ChatMessage[] | { data: ChatMessage[] }) => {
                const messages = Array.isArray(response) ? response : response.data;
                return [...messages].reverse();
            },
        }),

        createRoom: builder.mutation<ChatRoom, CreateRoomRequest>({
            query: (data) => ({
                url: '/chat/rooms',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Rooms'],
            transformResponse: (response: ChatRoom | { data: ChatRoom }) => {
                return 'data' in response ? response.data : response;
            },
        }),

        sendMessage: builder.mutation<ChatMessage, { roomId: string; formData: FormData }>({
            query: ({ roomId, formData }) => ({
                url: `/chat/rooms/${roomId}/messages`,
                method: 'POST',
                body: formData,
                formData: true,
            }),
            invalidatesTags: (_result, _error, { roomId }) => [{ type: 'Messages', id: roomId }],
            transformResponse: (response: ChatMessage | { data: ChatMessage }) => {
                return 'data' in response ? response.data : response;
            },
        }),

        addMember: builder.mutation<ChatRoom, { roomId: string; userId: string }>({
            query: ({ roomId, userId }) => ({
                url: `/chat/rooms/${roomId}/members`,
                method: 'POST',
                body: { userId },
            }),
            invalidatesTags: ['Rooms'],
        }),

        removeMember: builder.mutation<{ count: number }, { roomId: string; userId: string }>({
            query: ({ roomId, userId }) => ({
                url: `/chat/rooms/${roomId}/members/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Rooms'],
        }),
    }),
});

export const {
    useGetRoomsQuery,
    useGetMessagesQuery,
    useLazyGetMessagesQuery,
    useCreateRoomMutation,
    useSendMessageMutation,
    useAddMemberMutation,
    useRemoveMemberMutation,
} = chatApi;
