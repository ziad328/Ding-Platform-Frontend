import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
    initializeSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    onNewMessage,
    onSocketConnect,
    isSocketConnected,
} from '../services/socketService';
import { setCurrentRoom, addMessage } from '../store/slices/chat';
import { chatApi } from '../store/slices/chat/chatApi';
import { apiSlice } from '../store/ApiSlice';
import type { ChatMessage } from '../store/slices/chat/types';

// Hook for managing WebSocket connection lifecycle and room subscriptions.
// Socket messages are injected directly into the RTK Query cache via updateQueryData
// so there is a single source of truth for message data.
// A 4-second polling fallback in MessagesPage keeps messages flowing even when
// the socket is degraded on slow hosting environments.

export const useSocket = () => {
    const dispatch = useDispatch<AppDispatch>();
    const token = useSelector((state: RootState) => state.auth.token);
    const currentRoomId = useSelector((state: RootState) => state.chat.currentRoomId);
    const previousRoomId = useRef<string | null>(null);
    const isInitialized = useRef(false);
    const currentRoomIdRef = useRef<string | null>(currentRoomId);

    // Track mount count to avoid spurious disconnects in React StrictMode (dev)
    const mountCount = useRef(0);
    const disconnectTimer = useRef<number | null>(null);

    // Keep the ref current on every render so reconnect callback is never stale
    useEffect(() => {
        currentRoomIdRef.current = currentRoomId;
    });

    const handleNewMessage = useCallback((message: ChatMessage) => {
        // Optimistic: patch the RTK cache immediately so the message appears instantly
        dispatch(
            chatApi.util.updateQueryData('getMessages', { roomId: message.roomId }, (draft) => {
                if (!Array.isArray(draft)) return; // no cache entry yet — polling will pick it up
                const alreadyExists = draft.some(m => m.id === message.id);
                if (!alreadyExists) {
                    draft.push(message);
                }
            })
        );

        // Guaranteed fallback: invalidate the Messages tag so RTK re-fetches if the
        // optimistic patch was on a cache key that doesn't exist yet.
        dispatch(apiSlice.util.invalidateTags([{ type: 'Messages', id: message.roomId }]));

        // Update the sidebar last-message preview and room sort order
        dispatch(addMessage(message));
    }, [dispatch]);

    // Initialize / destroy the socket connection
    useEffect(() => {
        if (!token) return;
        mountCount.current += 1;

        // Cancel any pending disconnect from a previous unmount
        if (disconnectTimer.current !== null) {
            clearTimeout(disconnectTimer.current);
            disconnectTimer.current = null;
        }

        initializeSocket(token);
        isInitialized.current = true;

        onSocketConnect(() => {
            const roomId = currentRoomIdRef.current;
            if (roomId) {
                console.log('🔄 Socket reconnected — re-joining room:', roomId);
                joinRoom(roomId);
            }
        });

        return () => {
            mountCount.current -= 1;

            // In React StrictMode (dev), effects mount/unmount quickly; delay disconnect to avoid
            // spurious "WebSocket is closed before the connection is established" noise.
            if (mountCount.current === 0) {
                disconnectTimer.current = window.setTimeout(() => {
                    if (mountCount.current !== 0) return;
                    if (previousRoomId.current) {
                        leaveRoom(previousRoomId.current);
                    }
                    disconnectSocket();
                    isInitialized.current = false;
                    disconnectTimer.current = null;
                }, 150);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Always keep the message callback registered.
    // Re-registers after token refresh or handleNewMessage reference change.
    useEffect(() => {
        if (!token) return;
        onNewMessage(handleNewMessage);
    }, [token, handleNewMessage]);

    // Join / leave rooms as currentRoomId changes
    useEffect(() => {
        if (!isSocketConnected()) return;

        if (previousRoomId.current && previousRoomId.current !== currentRoomId) {
            leaveRoom(previousRoomId.current);
        }

        if (currentRoomId) {
            joinRoom(currentRoomId);
        }

        previousRoomId.current = currentRoomId;
    }, [currentRoomId]);

    const selectRoom = useCallback((roomId: string | null) => {
        dispatch(setCurrentRoom(roomId));
    }, [dispatch]);

    return {
        currentRoomId,
        selectRoom,
        isConnected: isSocketConnected(),
    };
};

export default useSocket;
