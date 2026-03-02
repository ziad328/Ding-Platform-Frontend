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
import { addMessage, setCurrentRoom } from '../store/slices/chat';
import type { ChatMessage } from '../store/slices/chat/types';

// Hook for managing WebSocket connection lifecycle and room subscriptions

export const useSocket = () => {
    const dispatch = useDispatch<AppDispatch>();
    const token = useSelector((state: RootState) => state.auth.token);
    const currentRoomId = useSelector((state: RootState) => state.chat.currentRoomId);
    const previousRoomId = useRef<string | null>(null);
    const isInitialized = useRef(false);
    const currentRoomIdRef = useRef<string | null>(currentRoomId);

    const handleNewMessage = useCallback((message: ChatMessage) => {
        dispatch(addMessage(message));
    }, [dispatch]);

    // Always update the ref so the connect callback is never stale
    useEffect(() => {
        currentRoomIdRef.current = currentRoomId;
    });

    onNewMessage(handleNewMessage);

    useEffect(() => {
        if (!token || isInitialized.current) return;

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
            if (previousRoomId.current) {
                leaveRoom(previousRoomId.current);
            }
            disconnectSocket();
            isInitialized.current = false;
        };
    }, [token]);

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
