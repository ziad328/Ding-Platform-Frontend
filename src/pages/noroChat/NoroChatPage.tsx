import { useState, useCallback, useRef } from 'react';
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
// Streaming animation config (client-side simulation)
// ─────────────────────────────────────────────────────────────────────────────
const THINK_DELAY_MS = 900;

function NoroChatPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const activeSessionId = useSelector(selectActiveSessionId);

  // Use a ref so async handlers always read the latest value without
  // becoming stale closures.
  const activeSessionIdRef = useRef<string | null>(activeSessionId);
  activeSessionIdRef.current = activeSessionId;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // ── Optimistic local messages keyed by sessionId ──────────────────────────
  // Map<sessionId, ChatMessage[]> so switching sessions never leaks messages.
  const [localMessagesBySession, setLocalMessagesBySession] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [isSending, setIsSending] = useState(false);

  // ── RTK Query hooks ───────────────────────────────────────────────────────
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

  // ── Derive active session and messages ────────────────────────────────────
  const sessions = sessionsData?.items ?? [];
  const activeSession = activeSessionId
    ? sessions.find((s) => s.id === activeSessionId) ?? null
    : null;

  const fetchedMessages: ChatMessage[] = messagesData?.items ?? [];
  const localMessages = activeSessionId
    ? (localMessagesBySession[activeSessionId] ?? [])
    : [];
  const displayedMessages: ChatMessage[] =
    localMessages.length > 0 ? localMessages : fetchedMessages;

  // ── New Chat ──────────────────────────────────────────────────────────────
  const handleNewChat = useCallback(() => {
    dispatch(clearActiveSession());
    setIsSidebarOpen(false);
  }, [dispatch]);

  // ── Select session ────────────────────────────────────────────────────────
  const handleSelectSession = useCallback(
    (id: string) => {
      dispatch(setActiveSession(id));
    },
    [dispatch]
  );

  // ── Delete session ────────────────────────────────────────────────────────
  const handleDeleteSession = useCallback(
    async (id: string) => {
      // Read the *current* active session from the ref (not stale closure)
      const currentActiveId = activeSessionIdRef.current;

      // Optimistically clear from sidebar immediately — the RTK cache
      // invalidation will remove it from the server list after the call.
      // If it was the active session, clear the view right away so the
      // user doesn't see a ghost session.
      if (currentActiveId === id) {
        dispatch(clearActiveSession());
      }

      // Clean up any local optimistic messages for that session
      setLocalMessagesBySession((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });

      try {
        await deleteSession(id).unwrap();
        // RTK Query will invalidate 'NoroChatSessions' and re-fetch the list.
      } catch {
        // API call failed — the session list will revert to the cached state
        // automatically (no optimistic update was applied to the server list).
        // If we cleared the active session, re-select it so the UI is consistent.
        if (currentActiveId === id) {
          dispatch(setActiveSession(id));
        }
      }
    },
    [deleteSession, dispatch]
    // NOTE: no activeSessionId in deps — we use the ref to avoid stale closure
  );

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;

      let targetSessionId = activeSessionIdRef.current;

      // 1️⃣ If no active session, create one first
      if (!targetSessionId) {
        try {
          const newSession = await createSession({ title: 'New Chat' }).unwrap();
          targetSessionId = newSession.id;
          dispatch(setActiveSession(newSession.id));
        } catch {
          return;
        }
      }

      const sessionId = targetSessionId; // narrow to string

      // 2️⃣ Optimistically append the user message to the correct session bucket
      const optimisticUserMsg: ChatMessage = {
        id: `local-${Date.now()}`,
        session_id: sessionId,
        role: 'user',
        content: text.trim(),
        created_at: new Date().toISOString(),
      };

      setLocalMessagesBySession((prev) => {
        const existing = prev[sessionId] ?? fetchedMessages;
        return { ...prev, [sessionId]: [...existing, optimisticUserMsg] };
      });

      setIsSending(true);

      // 3️⃣ Simulate thinking delay
      await new Promise<void>((r) => setTimeout(r, THINK_DELAY_MS));

      // 4️⃣ Send to API
      try {
        const response = await sendMessage({
          sessionId,
          message: text.trim(),
        }).unwrap();

        const aiMsg = response.assistant_message;

        // 5️⃣ Replace optimistic message with confirmed server messages
        setLocalMessagesBySession((prev) => {
          const current = prev[sessionId] ?? [];
          const withoutOptimistic = current.filter(
            (m) => m.id !== optimisticUserMsg.id
          );
          return {
            ...prev,
            [sessionId]: [...withoutOptimistic, response.user_message, aiMsg],
          };
        });

        // 6️⃣ Trigger streaming animation
        setStreamingMessageId(aiMsg.id);
        const streamDurationMs = Math.ceil((aiMsg.content.length / 6) * 16) + 400;
        setTimeout(() => setStreamingMessageId(null), streamDurationMs);
      } catch {
        // Remove optimistic message on failure
        setLocalMessagesBySession((prev) => {
          const current = prev[sessionId] ?? [];
          return {
            ...prev,
            [sessionId]: current.filter((m) => m.id !== optimisticUserMsg.id),
          };
        });
      } finally {
        setIsSending(false);
      }
    },
    [isSending, fetchedMessages, createSession, sendMessage, dispatch]
  );

  // ── Suggestion pill clicked ───────────────────────────────────────────────
  const handleSuggestionClick = useCallback(
    (text: string) => {
      handleSendMessage(text);
    },
    [handleSendMessage]
  );

  // ── Build the session shape NoroChatMain expects ──────────────────────────
  // Guard: if activeSessionId is set but the session no longer exists in the
  // list (e.g. just deleted), treat it as null so the welcome screen shows.
  const sessionExistsInList = activeSessionId
    ? sessions.some((s) => s.id === activeSessionId)
    : false;

  const activeSessionForMain =
    activeSessionId && (sessionExistsInList || sessionsLoading)
      ? {
          id: activeSessionId,
          title: activeSession?.title ?? 'Chat',
          messages: displayedMessages,
        }
      : null;

  // Clear the Redux active session if it no longer exists in the fetched list
  // (handles the case where the delete succeeded but clearActiveSession wasn't
  // dispatched yet, e.g. if the user deleted from another tab).
  if (
    activeSessionId &&
    !sessionsLoading &&
    !sessionExistsInList &&
    !isSending
  ) {
    dispatch(clearActiveSession());
  }

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
