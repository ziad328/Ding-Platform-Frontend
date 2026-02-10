// TypeScript interfaces for chat rooms, messages, members, and media

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface ChatMember {
  id: string;
  roomId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: ChatUser;
}

export interface MediaItem {
  id: string;
  messageId: string;
  url: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  replyToId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: ChatUser;
  media?: MediaItem[];
}

export interface ChatRoom {
  id: string;
  name?: string | null;
  type: 'DIRECT' | 'GROUP';
  createdAt: string;
  updatedAt: string;
  members: ChatMember[];
  messages?: ChatMessage[];
}

export interface CreateRoomRequest {
  userIds: string[];
  type: 'DIRECT' | 'GROUP';
  name?: string;
}

export interface AddMemberRequest {
  userId: string;
}

export interface ChatState {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  messages: Record<string, ChatMessage[]>;
  typingUsers: Record<string, string[]>;
  loading: boolean;
  error: string | null;
}
