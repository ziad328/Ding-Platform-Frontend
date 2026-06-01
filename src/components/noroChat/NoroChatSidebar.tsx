/**
 * NoroChatSidebar — collapsible session list with time-grouped headers.
 * Shows loading/error states inline. Adapts to mobile via slide-in drawer.
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MessageSquare, Loader2 } from 'lucide-react';
import type { ChatSession } from '../../types/noroChat';
import { groupSessionsByTime } from './utils';

interface NoroChatSidebarProps {
  sessions: ChatSession[];
  activeId: string | null;
  isLoading: boolean;
  isError: boolean;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NoroChatSidebar: React.FC<NoroChatSidebarProps> = ({
  sessions,
  activeId,
  isLoading,
  isError,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onClose,
}) => {
  const groups = groupSessionsByTime(sessions);

  const SidebarContent = ({ className = '' }: { className?: string }) => (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-3 shrink-0 border-b border-neutral-w-300/60 dark:border-dark-border/20">
        <div className="w-6 h-6 rounded-lg bg-linear-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-sm">
          <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
            <path d="M16 4L18.8 11.2H26.4L20.8 15.6L22.8 23.2L16 18.8L9.2 23.2L11.2 15.6L5.6 11.2H13.2L16 4Z" fill="white" opacity="0.9" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-neutral-b-800 dark:text-dark-text-primary tracking-tight">
          Noro Chats
        </h2>
      </div>

      {/* New Chat shortcut */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <motion.button
          id="noro-new-chat-btn"
          onClick={onNewChat}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-dashed border-neutral-w-400 dark:border-dark-border/50 text-neutral-b-400 dark:text-dark-text-muted hover:border-primary-400 dark:hover:border-primary-600/60 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-200 group"
        >
          <div className="w-5 h-5 rounded-md bg-neutral-w-300 dark:bg-dark-bg-tertiary group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 flex items-center justify-center transition-colors">
            <Plus size={12} />
          </div>
          <span className="text-xs font-medium">New conversation</span>
        </motion.button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto thin-scrollbar px-2 pb-4 pt-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2.5">
            <div className="relative">
              <Loader2 size={20} className="text-primary-500 animate-spin" />
              <div className="absolute inset-0 rounded-full bg-primary-500/10 animate-ping" />
            </div>
            <p className="text-xs text-neutral-b-400 dark:text-dark-text-muted">Loading chats…</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <X size={16} className="text-red-400" />
            </div>
            <p className="text-xs text-red-400">Failed to load chats</p>
            <p className="text-[11px] text-neutral-b-300 dark:text-dark-text-muted/60">Check your connection</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10 flex items-center justify-center shadow-inner">
              <MessageSquare size={18} className="text-primary-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-b-500 dark:text-dark-text-secondary">No conversations yet</p>
              <p className="text-[11px] text-neutral-b-300 dark:text-dark-text-muted/60 mt-0.5">Start a new chat above</p>
            </div>
          </div>
        ) : (
          groups.map(({ group, items }) => (
            <div key={group} className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-b-300 dark:text-dark-text-muted/50 px-3 py-1.5">
                {group}
              </p>
              <AnimatePresence initial={false}>
                {items.map((session) => (
                  <SidebarItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeId}
                    onSelect={() => { onSelectSession(session.id); onClose(); }}
                    onDelete={() => onDeleteSession(session.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 h-full border-r border-neutral-w-300/80 dark:border-dark-border/20 bg-neutral-w-100 dark:bg-dark-bg-primary">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
              onClick={onClose}
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[270px] md:hidden shadow-2xl bg-neutral-w-100 dark:bg-dark-bg-primary border-r border-neutral-w-300 dark:border-dark-border/30"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

interface SidebarItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ session, isActive, onSelect, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    onClick={onSelect}
    className={`group relative flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer mb-1 ${
      isActive
        ? 'bg-primary-500/10 dark:bg-primary-500/15 text-neutral-b-800 dark:text-dark-text-primary font-medium'
        : 'text-neutral-b-600 dark:text-dark-text-secondary hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary/70'
    }`}
  >
    {isActive && (
      <motion.div
        layoutId="active-session-bar"
        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-primary-500"
      />
    )}

    <div className="flex items-center gap-2.5 flex-1 min-w-0">
      <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
        isActive ? 'bg-primary-500' : 'bg-neutral-w-400 dark:bg-dark-border group-hover:bg-neutral-b-300 dark:group-hover:bg-dark-text-muted'
      }`} />
      <span className="flex-1 truncate leading-tight select-none text-[13px]">
        {session.title}
      </span>
    </div>

    <button
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="opacity-0 group-hover:opacity-100 shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-neutral-b-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
      title="Delete conversation"
    >
      <X size={12} />
    </button>
  </motion.div>
);

export default NoroChatSidebar;
