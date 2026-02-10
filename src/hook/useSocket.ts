import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
    initializeSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    onNewMessage,
    onRoomCreated,
    isSocketConnected,
} from '../services/socketService';
import { addMessage, addRoom, setCurrentRoom } from '../store/slices/chat';
import type { ChatMessage, ChatRoom } from '../store/slices/chat/types';

// Hook for managing WebSocket connection lifecycle and room subscriptions

export const useSocket = () => {
    const dispatch = useDispatch<AppDispatch>();
    const token = useSelector((state: RootState) => state.auth.token);
    const currentRoomId = useSelector((state: RootState) => state.chat.currentRoomId);
    const previousRoomId = useRef<string | null>(null);
    const isInitialized = useRef(false);
    const mountCount = useRef(0);
    const disconnectTimer = useRef<number | null>(null);

    const handleNewMessage = useCallback((message: ChatMessage) => {
        dispatch(addMessage(message));
    }, [dispatch]);

    const handleRoomCreated = useCallback((room: ChatRoom) => {
        dispatch(addRoom(room));
    }, [dispatch]);

    useEffect(() => {
        if (!token) return;
        mountCount.current += 1;

        if (disconnectTimer.current) {
            window.clearTimeout(disconnectTimer.current);
            disconnectTimer.current = null;
        }

        if (!isInitialized.current) {
            initializeSocket(token);
            isInitialized.current = true;
            onNewMessage(handleNewMessage);
            onRoomCreated(handleRoomCreated);
        }

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
    }, [token, handleNewMessage]);

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
