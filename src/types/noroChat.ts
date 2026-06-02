// ─────────────────────────────────────────────────────────────────────────────
// NoroChat API — TypeScript interfaces
// Base URL: http://72.60.47.186/model-api
// ─────────────────────────────────────────────────────────────────────────────

// ── Request bodies ────────────────────────────────────────────────────────────

export interface UpdateUserContextBody {
  display_name?: string;
  username?: string;
  bio?: string;
  language?: string;
  location?: string;
}

export interface CreateSessionBody {
  title: string;
}

export interface SendMessageBody {
  sessionId: string;
  message: string;
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface HealthCheckResponse {
  status: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface PaginatedSessions {
  items: ChatSession[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string; // ISO 8601
}

export interface PaginatedMessages {
  items: ChatMessage[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface SessionDetail {
  id: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at?: string;
}

export interface SendMessageResponse {
  session_id: string;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}
