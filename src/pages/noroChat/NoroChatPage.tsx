import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import NoroChatSidebar from '../../components/noroChat/NoroChatSidebar';
import NoroChatMain from '../../components/noroChat/NoroChatMain';
import type { NoroChatConversation, NoroChatMessage } from '../../components/noroChat/types';
import { generateTitle, genId } from '../../components/noroChat/utils';
import { getRandomResponse } from '../../components/noroChat/mockResponses';

// ─────────────────────────────────────────────────────────────
// Simulate a streaming AI response
// ─────────────────────────────────────────────────────────────
const THINK_DELAY_MS = 900; // dot-dot-dot "thinking" duration

function NoroChatPage() {
  const user = useSelector(selectCurrentUser);

  const [conversations, setConversations] = useState<NoroChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  // ── Create a new conversation ──────────────────────────────
  const handleNewChat = useCallback(() => {
    setActiveId(null);
    setIsSidebarOpen(false);
  }, []);

  // ── Select an existing conversation ───────────────────────
  const handleSelectConversation = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  // ── Delete a conversation ──────────────────────────────────
  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    },
    [activeId]
  );

  // ── Core: send a message and simulate an AI response ───────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: NoroChatMessage = {
        id: genId(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };

      let targetId = activeId;

      setConversations((prev) => {
        // Create a new conversation if none is active
        if (!targetId) {
          const newConv: NoroChatConversation = {
            id: genId(),
            title: generateTitle(text),
            createdAt: new Date(),
            messages: [userMsg],
          };
          targetId = newConv.id;
          return [newConv, ...prev];
        }

        // Append to existing conversation
        return prev.map((c) =>
          c.id === targetId ? { ...c, messages: [...c.messages, userMsg] } : c
        );
      });

      // Set the active conversation (needed for new conv)
      // We need targetId in scope after the setState — use a ref trick via closure
      // The state update above sets targetId in the outer closure; use another state setter
      setActiveId(() => {
        // targetId is set in the closure above
        return targetId!;
      });

      // ── "Thinking" phase ────────────────────────────────
      setIsLoading(true);

      await new Promise<void>((r) => setTimeout(r, THINK_DELAY_MS));

      // ── Build AI response ────────────────────────────────
      const mock = getRandomResponse();
      const aiMsgId = genId();
      const aiMsg: NoroChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: mock.content,
        timestamp: new Date(),
        suggestions: mock.suggestions,
      };

      setIsLoading(false);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetId ? { ...c, messages: [...c.messages, aiMsg] } : c
        )
      );

      // ── Trigger streaming on the new AI message ──────────
      setStreamingMessageId(aiMsgId);

      // Clear streaming flag after estimated stream duration
      // ~content.length / CHARS_PER_TICK * TICK_MS + buffer
      const streamDurationMs = Math.ceil((mock.content.length / 6) * 16) + 400;
      setTimeout(() => setStreamingMessageId(null), streamDurationMs);
    },
    [activeId, isLoading]
  );

  // ── Suggestion pill clicked ────────────────────────────────
  const handleSuggestionClick = useCallback(
    (text: string) => {
      handleSendMessage(text);
    },
    [handleSendMessage]
  );

  return (
    <div className="flex h-full overflow-hidden bg-neutral-w-200 dark:bg-dark-bg-primary">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <NoroChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ── Main chat area ───────────────────────────────────── */}
      <NoroChatMain
        conversation={activeConversation}
        isLoading={isLoading}
        streamingMessageId={streamingMessageId}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        username={user?.name || user?.username}
      />
    </div>
  );
}

export default NoroChatPage;
