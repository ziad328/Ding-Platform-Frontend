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

  // Refs for aborting in-flight operations.
  // abortControllerRef cancels the think-delay promise.
  // sendMutationRef holds the RTK mutation result so we can call .abort() on it.
  const abortControllerRef = useRef<AbortController | null>(null);
  const sendMutationRef = useRef<{ abort: () => void } | null>(null);
  // Tracks the optimistic message id for the current in-flight send so we can
  // remove it on abort.
  const optimisticMsgRef = useRef<{ sessionId: string; msgId: string } | null>(null);

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

  /**
   * Aborts any in-flight generation: cancels the think-delay, aborts the RTK
   * mutation, and removes the optimistic message from the local store.
   */
  const abortCurrentRequest = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    sendMutationRef.current?.abort();
    sendMutationRef.current = null;

    // Remove the dangling optimistic message so the chat looks clean.
    if (optimisticMsgRef.current) {
      const { sessionId, msgId } = optimisticMsgRef.current;
      setLocalMessagesBySession((prev) => {
        const current = prev[sessionId] ?? [];
        const filtered = current.filter((m) => m.id !== msgId);
        return { ...prev, [sessionId]: filtered };
      });
      optimisticMsgRef.current = null;
    }

    setIsSending(false);
    setStreamingMessageId(null);
  }, []);

  /** User clicked "Stop" button while generating. */
  const handleStop = useCallback(() => {
    abortCurrentRequest();
  }, [abortCurrentRequest]);

  const handleNewChat = useCallback(() => {
    abortCurrentRequest();
    dispatch(clearActiveSession());
    setIsSidebarOpen(false);
  }, [dispatch, abortCurrentRequest]);

  const handleSelectSession = useCallback((id: string) => {
    abortCurrentRequest();
    dispatch(setActiveSession(id));
  }, [dispatch, abortCurrentRequest]);

  const handleDeleteSession = useCallback(async (id: string) => {
    const currentActiveId = activeSessionIdRef.current;
    if (currentActiveId === id) {
      abortCurrentRequest();
      dispatch(clearActiveSession());
    }

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
  }, [deleteSession, dispatch, updateTitles, abortCurrentRequest]);

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

    optimisticMsgRef.current = { sessionId, msgId: optimisticUserMsg.id };

    setLocalMessagesBySession((prev) => {
      const existing = prev[sessionId] ?? [];
      return { ...prev, [sessionId]: [...existing, optimisticUserMsg] };
    });

    // Set up an AbortController to cancel the think-delay if the user
    // navigates away or clicks Stop before the request fires.
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSending(true);

    // Wait for the think delay, but bail out early if aborted.
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, THINK_DELAY_MS);
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        resolve();
      });
    });

    // If the controller was aborted during the delay, stop here — the
    // abortCurrentRequest() call already cleaned up the optimistic message.
    if (controller.signal.aborted) return;

    try {
      const mutationResult = sendMessage({ sessionId, message: text.trim() });
      sendMutationRef.current = mutationResult;

      const response = await mutationResult.unwrap();
      sendMutationRef.current = null;

      // Guard: if the session changed while we were waiting, discard the result.
      if (controller.signal.aborted) return;

      const aiMsg = response.assistant_message;
      optimisticMsgRef.current = null;

      setLocalMessagesBySession((prev) => {
        const current = prev[sessionId] ?? [];
        const withoutOptimistic = current.filter((m) => m.id !== optimisticUserMsg.id);
        return { ...prev, [sessionId]: [...withoutOptimistic, response.user_message, aiMsg] };
      });

      setStreamingMessageId(aiMsg.id);
      const streamDurationMs = Math.ceil((aiMsg.content.length / 6) * 16) + 400;
      setTimeout(() => setStreamingMessageId(null), streamDurationMs);
    } catch {
      // Abort errors are expected — only clean up the optimistic message for
      // genuine network failures (abortCurrentRequest handles the abort case).
      if (!controller.signal.aborted) {
        setLocalMessagesBySession((prev) => {
          const current = prev[sessionId] ?? [];
          return { ...prev, [sessionId]: current.filter((m) => m.id !== optimisticUserMsg.id) };
        });
        optimisticMsgRef.current = null;
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsSending(false);
        abortControllerRef.current = null;
      }
    }
  }, [isSending, createSession, sendMessage, dispatch, updateTitles]);

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
        onStop={handleStop}
        username={user?.name || user?.username}
        errorMessage={inlineError}
      />
    </div>
  );
}

export default NoroChatPage;
