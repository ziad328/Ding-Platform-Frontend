import { useSocket } from '../../hook/useSocket';

/**
 * Boots the chat socket connection globally for authenticated users.
 * No UI — just initializes the socket + listeners.
 */
export default function ChatSocketBootstrap() {
  useSocket();
  return null;
}

