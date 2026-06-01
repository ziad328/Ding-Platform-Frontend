/**
 * NoroChatPage — top-level page that wires RTK Query data (sessions, messages)
 * to the Sidebar and Main components. Manages optimistic messages, client-side
 * title derivation (persisted to localStorage), and active session UI state via Redux.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
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
import { generateTitle } from '../../components/noroChat/utils';
import NoroChatSidebar from '../../components/noroChat/NoroChatSidebar';
import NoroChatMain from '../../components/noroChat/NoroChatMain';

const THINK_DELAY_MS = 900;
const LOCAL_TITLES_KEY = 'noro-session-titles';

function readPersistedTitles(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_TITLES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writePersistedTitles(titles: Record<string, string>) {
  try {
    localStorage.setItem(LOCAL_TITLES_KEY, JSON.stringify(titles));
  } catch {}
}

function NoroChatPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const activeSessionId = useSelector(selectActiveSessionId);

  const activeSessionIdRef = useRef<string | null>(activeSessionId);
  activeSessionIdRef.current = activeSessionId;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [localMessagesBySession, setLocalMessagesBySession] = useState<Record<string, ChatMessage[]>>({});
  const [isSending, setIsSending] = useState(false);

  // Titles are seeded from localStorage on mount so they survive page refreshes.
  const [localTitles, setLocalTitles] = useState<Record<string, string>>(readPersistedTitles);

  const updateTitles = useCallback((updater: (prev: Record<string, string>) => Record<string, string>) => {
    setLocalTitles((prev) => {
      const next = updater(prev);
      writePersistedTitles(next);
      return next;
    });
  }, []);

  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    isFetching: sessionsFetching,
    isError: sessionsError,
  } = useGetChatSessionsQuery();
  const { data: messagesData, isLoading: messagesLoading, isError: messagesError } = useGetMessagesQuery(activeSessionId!, { skip: !activeSessionId });

  const [createSession] = useCreateChatSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [sendMessage] = useSendMessageMutation();

  const sessions = sessionsData?.items ?? [];
  const activeSession = activeSessionId ? sessions.find((s) => s.id === activeSessionId) ?? null : null;
  const fetchedMessages: ChatMessage[] = messagesData?.items ?? [];
  const localMessages = activeSessionId ? (localMessagesBySession[activeSessionId] ?? []) : [];
  const displayedMessages: ChatMessage[] = localMessages.length > 0 ? localMessages : fetchedMessages;

  const handleNewChat = useCallback(() => {
    dispatch(clearActiveSession());
    setIsSidebarOpen(false);
  }, [dispatch]);

  const handleSelectSession = useCallback((id: string) => {
    dispatch(setActiveSession(id));
  }, [dispatch]);

  const handleDeleteSession = useCallback(async (id: string) => {
    const currentActiveId = activeSessionIdRef.current;
    if (currentActiveId === id) dispatch(clearActiveSession());

    setLocalMessagesBySession((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev }; delete next[id]; return next;
    });
    updateTitles((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev }; delete next[id]; return next;
    });

    try {
      await deleteSession(id).unwrap();
    } catch {
      if (currentActiveId === id) dispatch(setActiveSession(id));
    }
  }, [deleteSession, dispatch, updateTitles]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isSending) return;

    let targetSessionId = activeSessionIdRef.current;

    if (!targetSessionId) {
      try {
        const newSession = await createSession({ title: 'New Chat' }).unwrap();
        targetSessionId = newSession.id;
        dispatch(setActiveSession(newSession.id));
        updateTitles((prev) => ({ ...prev, [newSession.id]: generateTitle(text.trim()) }));
      } catch {
        return;
      }
    }

    const sessionId = targetSessionId;

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
    await new Promise<void>((r) => setTimeout(r, THINK_DELAY_MS));

    try {
      const response = await sendMessage({ sessionId, message: text.trim() }).unwrap();
      const aiMsg = response.assistant_message;

      setLocalMessagesBySession((prev) => {
        const current = prev[sessionId] ?? [];
        const withoutOptimistic = current.filter((m) => m.id !== optimisticUserMsg.id);
        return { ...prev, [sessionId]: [...withoutOptimistic, response.user_message, aiMsg] };
      });

      setStreamingMessageId(aiMsg.id);
      const streamDurationMs = Math.ceil((aiMsg.content.length / 6) * 16) + 400;
      setTimeout(() => setStreamingMessageId(null), streamDurationMs);
    } catch {
      setLocalMessagesBySession((prev) => {
        const current = prev[sessionId] ?? [];
        return { ...prev, [sessionId]: current.filter((m) => m.id !== optimisticUserMsg.id) };
      });
    } finally {
      setIsSending(false);
    }
  }, [isSending, fetchedMessages, createSession, sendMessage, dispatch, updateTitles]);

  const handleSuggestionClick = useCallback((text: string) => {
    handleSendMessage(text);
  }, [handleSendMessage]);

  const sessionsWithTitles = sessions.map((s) =>
    localTitles[s.id] ? { ...s, title: localTitles[s.id] } : s
  );

  const sessionExistsInList = activeSessionId ? sessions.some((s) => s.id === activeSessionId) : false;
  const resolvedTitle = (activeSessionId && localTitles[activeSessionId]) ?? activeSession?.title ?? 'Chat';

  const activeSessionForMain =
    activeSessionId && (sessionExistsInList || sessionsLoading)
      ? { id: activeSessionId, title: resolvedTitle, messages: displayedMessages }
      : null;

  useEffect(() => {
    if (
      activeSessionId &&
      !sessionsLoading &&
      !sessionsFetching &&
      !sessionExistsInList &&
      !isSending
    ) {
      dispatch(clearActiveSession());
    }
  }, [
    activeSessionId,
    sessionsLoading,
    sessionsFetching,
    sessionExistsInList,
    isSending,
    dispatch,
  ]);

  const inlineError = messagesError ? 'Could not load messages. Please try again.' : null;

  return (
    <div className="flex h-dvh overflow-hidden bg-neutral-w-200 dark:bg-dark-bg-primary">
      <NoroChatSidebar
        sessions={sessionsWithTitles}
        activeId={activeSessionId}
        isLoading={sessionsLoading}
        isError={sessionsError}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
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
