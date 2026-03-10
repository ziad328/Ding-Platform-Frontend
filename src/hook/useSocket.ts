import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
import { setCurrentRoom, updateRoomLastMessage } from '../store/slices/chat';
import { chatApi } from '../store/slices/chat/chatApi';
import { apiSlice } from '../store/ApiSlice';
import type { ChatMessage } from '../store/slices/chat/types';

// Hook for managing WebSocket connection lifecycle and room subscriptions.
// Socket messages are injected directly into the RTK Query cache via updateQueryData
// so there is a single source of truth for message data.

export const useSocket = () => {
    const dispatch = useDispatch<AppDispatch>();
    const token = useSelector((state: RootState) => state.auth.token);
    const currentRoomId = useSelector((state: RootState) => state.chat.currentRoomId);
    const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
    const location = useLocation();
    const navigate = useNavigate();
    const previousRoomId = useRef<string | null>(null);
    const isInitialized = useRef(false);
    const currentRoomIdRef = useRef<string | null>(currentRoomId);

    // Keep the ref current on every render so reconnect callback is never stale
    useEffect(() => {
        currentRoomIdRef.current = currentRoomId;
    });

    const handleNewMessage = useCallback((message: ChatMessage) => {
        // Optimistic: patch the RTK cache immediately so the message appears instantly
        dispatch(
            chatApi.util.updateQueryData('getMessages', { roomId: message.roomId }, (draft) => {
                if (!Array.isArray(draft)) return; // no cache entry yet, skip
                const alreadyExists = draft.some(m => m.id === message.id);
                if (!alreadyExists) {
                    draft.push(message);
                }
            })
        );

        // Guaranteed fallback: invalidate the Messages tag so RTK re-fetches if needed.
        // This also updates the sidebar last-message preview via a fresh rooms fetch is NOT
        // triggered here — we handle the sidebar update manually below.
        dispatch(apiSlice.util.invalidateTags([{ type: 'Messages', id: message.roomId }]));

        // Update the sidebar last-message preview and room sort order
        dispatch(updateRoomLastMessage(message));
    }, [dispatch]);

    useEffect(() => {
        if (!token) return;
        mountCount.current += 1;

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
    }, [token]);

    // Always keep the message callback registered.
    // This runs on mount AND whenever the token changes (e.g. after a 401 token refresh
    // that calls reinitializeSocket externally and resets the callback).
    // The [token] dependency is the key — it re-runs after ApiSlice's reinitializeSocket.
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
