import { apiSlice } from '../../ApiSlice';
import type { ChatRoom, ChatMessage, CreateRoomRequest, SendMessageRequest } from './types';

// RTK Query endpoints for chat rooms and messages API

const normalizeMessage = (message: any): ChatMessage => {
    const id = message?.id ?? message?._id;
    return { ...message, id };
};

const normalizeMember = (member: any) => {
    const id = member?.id ?? member?._id;
    return { ...member, id };
};

const normalizeRoom = (room: any): ChatRoom => {
    const id = room?.id ?? room?._id;
    const members = Array.isArray(room?.members) ? room.members.map(normalizeMember) : [];
    const messages = Array.isArray(room?.messages) ? room.messages.map(normalizeMessage) : room?.messages;
    return { ...room, id, members, messages };
};

// Backend responses are wrapped by `ResponseInterceptor`:
// { code, success, message, data: <actual> }
const unwrapResponseData = (response: any) => response?.data ?? response;

export const chatApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRooms: builder.query<ChatRoom[], void>({
            query: () => '/chat/rooms',
            providesTags: ['Rooms'],
            transformResponse: (response: unknown) => {
                const unwrapped = unwrapResponseData(response as any);
                // Chat service returns: { data: RoomWithMembers[], pagination: {...} }
                const rooms = Array.isArray(unwrapped)
                    ? (unwrapped as any[])
                    : Array.isArray(unwrapped?.data)
                      ? (unwrapped.data as any[])
                      : [];

                const normalizedRooms = rooms.map((r) => normalizeRoom(r));

                return [...normalizedRooms].sort((a, b) =>
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
            transformResponse: (response: unknown) => {
                const unwrapped = unwrapResponseData(response as any);
                // Chat service returns: { data: MessageWithRelations[], pagination: {...} }
                const messages = Array.isArray(unwrapped)
                    ? (unwrapped as any[])
                    : Array.isArray(unwrapped?.data)
                      ? (unwrapped.data as any[])
                      : [];

                const normalizedMessages = messages.map((m) => normalizeMessage(m));
                // Backend already returns messages in chronological order (oldest -> newest).
                // Reversing here would show newest at the top of the chat.
                return normalizedMessages;
            },
        }),

        createRoom: builder.mutation<ChatRoom, CreateRoomRequest>({
            query: (data) => ({
                url: '/chat/rooms',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Rooms'],
            transformResponse: (response: unknown) => {
                const rawRoom = unwrapResponseData(response as any);
                return normalizeRoom(rawRoom);
            },
        }),

        // Send a normal text message (JSON body)
        sendMessage: builder.mutation<ChatMessage, SendMessageRequest>({
            query: ({ roomId, ...body }) => ({
                url: `/chat/rooms/${roomId}/messages`,
                method: 'POST',
                body: { roomId, ...body },
            }),
            invalidatesTags: (_result, _error, { roomId }) => [{ type: 'Messages', id: roomId }],
            transformResponse: (response: unknown) => {
                const rawMessage = unwrapResponseData(response as any);
                return normalizeMessage(rawMessage);
            },
        }),

        // Send a message with media attachments (multipart/form-data)
        sendMessageWithMedia: builder.mutation<ChatMessage, { roomId: string; formData: FormData }>({
            query: ({ roomId, formData }) => ({
                url: `/chat/rooms/${roomId}/messages/media`,
                method: 'POST',
                body: formData,
                formData: true,
            }),
            // No invalidatesTags — we inject the message into the cache manually below.
            // This prevents a full re-fetch after every send, which was causing the
            // "message disappears" bug.
            transformResponse: (response: ChatMessage | { data: ChatMessage }) => {
                return 'data' in response ? response.data : response;
            },
            async onQueryStarted({ roomId }, { dispatch, queryFulfilled }) {
                try {
                    const { data: sentMessage } = await queryFulfilled;
                    // Inject the sent message directly into the RTK Query cache.
                    // The socket will also deliver it, but addMessage/updateQueryData
                    // deduplicates by ID so it shows up exactly once.
                    dispatch(
                        chatApi.util.updateQueryData('getMessages', { roomId }, (draft) => {
                            const alreadyExists = draft.some(m => m.id === sentMessage.id);
                            if (!alreadyExists) {
                                draft.push(sentMessage);
                            }
                        })
                    );
                } catch {
                    // Send failed — the mutation's error state handles UI feedback
                }
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
    useSendMessageWithMediaMutation,
    useAddMemberMutation,
    useRemoveMemberMutation,
} = chatApi;
