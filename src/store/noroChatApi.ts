/**
 * noroChatApi — RTK Query slice exclusively for the NoroChat model API.
 * Base URL: http://72.60.47.186/model-api
 * Auth: Bearer token from state.auth + X-API-Key from VITE_NORO_API_KEY env var.
 * Do NOT merge endpoints from the main apiSlice into this file.
 */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { selectCurrentToken } from './slices/auth/auth';
import type {
  HealthCheckResponse,
  UpdateUserContextBody,
  CreateSessionBody,
  ChatSession,
  PaginatedSessions,
  SessionDetail,
  PaginatedMessages,
  SendMessageResponse,
} from '../types/noroChat';

const NORO_BASE_URL =
  (import.meta.env.VITE_NORO_BASE_URL as string | undefined) ||
  'http://72.60.47.186/model-api';

const NORO_API_KEY = import.meta.env.VITE_NORO_API_KEY as string | undefined;

export const noroChatApi = createApi({
  reducerPath: 'noroChatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: NORO_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = selectCurrentToken(getState() as any);
      if (token) headers.set('Authorization', `Bearer ${token}`);
      if (NORO_API_KEY) headers.set('X-API-Key', NORO_API_KEY);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['NoroChatSessions', 'NoroChatMessages'],
  endpoints: (builder) => ({
    healthCheck: builder.query<HealthCheckResponse, void>({
      query: () => '/health',
    }),
    updateUserContext: builder.mutation<void, UpdateUserContextBody>({
      query: (body) => ({ url: '/chat/me/context', method: 'PATCH', body }),
    }),
    createChatSession: builder.mutation<ChatSession, CreateSessionBody>({
      query: (body) => ({ url: '/chat/sessions', method: 'POST', body }),
      invalidatesTags: ['NoroChatSessions'],
    }),
    getChatSessions: builder.query<PaginatedSessions, void>({
      query: () => '/chat/sessions',
      providesTags: ['NoroChatSessions'],
    }),
    getSessionDetail: builder.query<SessionDetail, string>({
      query: (sessionId) => `/chat/sessions/${sessionId}`,
    }),
    deleteSession: builder.mutation<void, string>({
      query: (sessionId) => ({ url: `/chat/sessions/${sessionId}`, method: 'DELETE' }),
      invalidatesTags: ['NoroChatSessions'],
    }),
    sendMessage: builder.mutation<SendMessageResponse, { sessionId: string; message: string }>({
      query: ({ sessionId, message }) => ({
        url: `/chat/sessions/${sessionId}/messages`,
        method: 'POST',
        body: { message },
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        { type: 'NoroChatMessages', id: sessionId },
      ],
    }),
    getMessages: builder.query<PaginatedMessages, string>({
      query: (sessionId) => `/chat/sessions/${sessionId}/messages`,
      providesTags: (_result, _error, sessionId) => [
        { type: 'NoroChatMessages', id: sessionId },
      ],
    }),
  }),
});

export const {
  useHealthCheckQuery,
  useUpdateUserContextMutation,
  useCreateChatSessionMutation,
  useGetChatSessionsQuery,
  useGetSessionDetailQuery,
  useDeleteSessionMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
} = noroChatApi;
