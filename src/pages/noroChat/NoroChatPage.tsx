import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import {
  selectActiveSessionId,
  setActiveSession,
  clearActiveSession,
} from '../../store/slices/noroChat/chatSlice';
import {
  useGetChatSessionsQuery,
  useCreateChatSessionMutation,
  useDeleteSessionMutation,
  useSendMessageMutation,
  useGetMessagesQuery,
} from '../../store/noroChatApi';
import type { ChatMessage } from '../../types/noroChat';
import NoroChatSidebar from '../../components/noroChat/NoroChatSidebar';
import NoroChatMain from '../../components/noroChat/NoroChatMain';

// ─────────────────────────────────────────────────────────────────────────────
// Streaming animation config (client-side simulation, same as before)
// ─────────────────────────────────────────────────────────────────────────────
const THINK_DELAY_MS = 900;

function NoroChatPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const activeSessionId = useSelector(selectActiveSessionId);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // ── Optimistic local messages (shown immediately after send, before refetch) ──
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  // Track whether we are in the "sending + waiting for AI" phase
  const [isSending, setIsSending] = useState(false);

  // ── RTK Query hooks ───────────────────────────────────────────────────────────
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    isError: sessionsError,
  } = useGetChatSessionsQuery();

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
  } = useGetMessagesQuery(activeSessionId!, { skip: !activeSessionId });

  const [createSession] = useCreateChatSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [sendMessage] = useSendMessageMutation();

  // ── Derive the active session object ────────────────────────────────────────
  const sessions = sessionsData?.items ?? [];
  const activeSession = activeSessionId
    ? sessions.find((s) => s.id === activeSessionId) ?? null
    : null;

  // Combine fetched messages with any optimistic local ones
  const fetchedMessages: ChatMessage[] = messagesData?.items ?? [];
  const displayedMessages: ChatMessage[] =
    localMessages.length > 0 ? localMessages : fetchedMessages;

  // ── New Chat ─────────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    dispatch(clearActiveSession());
    setLocalMessages([]);
    setIsSidebarOpen(false);
  }, [dispatch]);

  // ── Select session ───────────────────────────────────────────────────────────
  const handleSelectSession = useCallback(
    (id: string) => {
      dispatch(setActiveSession(id));
      setLocalMessages([]); // clear local buffer when switching sessions
    },
    [dispatch]
  );

  // ── Delete session ───────────────────────────────────────────────────────────
  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await deleteSession(id).unwrap();
        if (activeSessionId === id) {
          dispatch(clearActiveSession());
          setLocalMessages([]);
        }
      } catch {
        // Deletion failed silently — sidebar will re-render from cache
      }
    },
    [activeSessionId, deleteSession, dispatch]
  );

  // ── Send message ─────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;

      let targetSessionId = activeSessionId;

      // 1️⃣ If no active session, create one first
      if (!targetSessionId) {
        try {
          const newSession = await createSession({ title: 'New Chat' }).unwrap();
          targetSessionId = newSession.id;
          dispatch(setActiveSession(newSession.id));
        } catch {
          // Could not create session — show nothing, user can retry
          return;
        }
      }

      // 2️⃣ Optimistically append the user message locally
      const optimisticUserMsg: ChatMessage = {
        id: `local-${Date.now()}`,
        session_id: targetSessionId,
        role: 'user',
        content: text.trim(),
        created_at: new Date().toISOString(),
      };

      setLocalMessages((prev) => {
        // Seed from fetched if local is empty
        const base = prev.length === 0 ? fetchedMessages : prev;
        return [...base, optimisticUserMsg];
      });

      setIsSending(true);

      // 3️⃣ Simulate the "thinking" delay before API call resolves
      await new Promise<void>((r) => setTimeout(r, THINK_DELAY_MS));

      // 4️⃣ Actually send the message
      try {
        const response = await sendMessage({
          sessionId: targetSessionId,
          message: text.trim(),
        }).unwrap();

        const aiMsg = response.assistant_message;

        // 5️⃣ Replace optimistic user message with real ones + AI response
        setLocalMessages((prev) => {
          const withoutOptimistic = prev.filter((m) => m.id !== optimisticUserMsg.id);
          return [...withoutOptimistic, response.user_message, aiMsg];
        });

        // 6️⃣ Trigger streaming animation on the AI message
        setStreamingMessageId(aiMsg.id);
        const streamDurationMs = Math.ceil((aiMsg.content.length / 6) * 16) + 400;
        setTimeout(() => setStreamingMessageId(null), streamDurationMs);
      } catch {
        // Remove optimistic message on failure, show inline error via messagesError
        setLocalMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id));
      } finally {
        setIsSending(false);
      }
    },
    [
      activeSessionId,
      isSending,
      fetchedMessages,
      createSession,
      sendMessage,
      dispatch,
    ]
  );

  // ── Suggestion pill clicked ──────────────────────────────────────────────────
  const handleSuggestionClick = useCallback(
    (text: string) => {
      handleSendMessage(text);
    },
    [handleSendMessage]
  );

  // ── Build the session shape NoroChatMain expects ─────────────────────────────
  const activeSessionForMain =
    activeSession && !messagesLoading
      ? {
          id: activeSession.id,
          title: activeSession.title,
          messages: displayedMessages,
        }
      : activeSessionId
      ? // Session is known but messages are still loading — pass empty
        {
          id: activeSessionId,
          title: activeSession?.title ?? 'Chat',
          messages: displayedMessages,
        }
      : null;

  const inlineError = messagesError
    ? 'Could not load messages. Please try again.'
    : null;

  return (
    <div className="flex h-full overflow-hidden bg-neutral-w-200 dark:bg-dark-bg-primary">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <NoroChatSidebar
        sessions={sessions}
        activeId={activeSessionId}
        isLoading={sessionsLoading}
        isError={sessionsError}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* ── Main chat area ───────────────────────────────────── */}
      <NoroChatMain
        session={activeSessionForMain}
        isLoading={isSending || messagesLoading}
        streamingMessageId={streamingMessageId}
        onSendMessage={handleSendMessage}
        onSuggestionClick={handleSuggestionClick}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        username={user?.name || user?.username}
        errorMessage={inlineError}
      />
    </div>
  );
}

export default NoroChatPage;
