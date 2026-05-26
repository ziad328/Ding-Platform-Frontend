import type { NoroChatConversation } from './types';

// ─────────────────────────────────────────────────────────────
// Time-group helper
// ─────────────────────────────────────────────────────────────
export type TimeGroup = 'Today' | 'Previous 7 Days' | 'Previous 30 Days' | 'Older';

export function getTimeGroup(date: Date): TimeGroup {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 1) return 'Today';
  if (diffDays < 7) return 'Previous 7 Days';
  if (diffDays < 30) return 'Previous 30 Days';
  return 'Older';
}

export function groupConversationsByTime(
  conversations: NoroChatConversation[]
): { group: TimeGroup; items: NoroChatConversation[] }[] {
  const order: TimeGroup[] = ['Today', 'Previous 7 Days', 'Previous 30 Days', 'Older'];
  const map: Record<TimeGroup, NoroChatConversation[]> = {
    Today: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: [],
  };

  for (const conv of conversations) {
    map[getTimeGroup(conv.createdAt)].push(conv);
  }

  return order
    .filter((g) => map[g].length > 0)
    .map((g) => ({ group: g, items: map[g] }));
}

// ─────────────────────────────────────────────────────────────
// Title generation from first user message
// ─────────────────────────────────────────────────────────────
export function generateTitle(text: string): string {
  const cleaned = text.replace(/\n/g, ' ').trim();
  return cleaned.length > 40 ? cleaned.slice(0, 37) + '…' : cleaned;
}

// ─────────────────────────────────────────────────────────────
// Unique ID
// ─────────────────────────────────────────────────────────────
export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
