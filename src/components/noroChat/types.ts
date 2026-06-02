// Shared types for Noro Chat
export interface NoroChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface NoroChatConversation {
  id: string;
  title: string;
  createdAt: Date;
  messages: NoroChatMessage[];
}
