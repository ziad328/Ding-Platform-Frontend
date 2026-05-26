import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MessageSquare } from 'lucide-react';
import type { NoroChatConversation } from './types';
import { groupConversationsByTime } from './utils';

interface NoroChatSidebarProps {
  conversations: NoroChatConversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;       // mobile drawer state
  onClose: () => void;
}

const NoroChatSidebar: React.FC<NoroChatSidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isOpen,
  onClose,
}) => {
  const groups = groupConversationsByTime(conversations);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-neutral-w-100 dark:bg-dark-bg-secondary">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 shrink-0">
        <h2 className="text-base font-semibold text-neutral-b-800 dark:text-dark-text-primary">
          Chats
        </h2>
        <div className="flex items-center gap-1">
          <button
            id="noro-new-chat-btn"
            onClick={onNewChat}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-b-500 dark:text-dark-text-muted hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary hover:text-neutral-b-800 dark:hover:text-dark-text-primary transition-all duration-150"
            title="New chat"
          >
            <Plus size={18} />
          </button>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-neutral-b-500 dark:text-dark-text-muted hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary transition-all duration-150"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto thin-scrollbar px-2 pb-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
              <MessageSquare size={18} className="text-primary-500" />
            </div>
            <p className="text-sm text-neutral-b-400 dark:text-dark-text-muted">
              No conversations yet
            </p>
            <p className="text-xs text-neutral-b-300 dark:text-dark-text-muted/60 mt-1">
              Start a new chat above
            </p>
          </div>
        ) : (
          groups.map(({ group, items }) => (
            <div key={group} className="mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-b-300 dark:text-dark-text-muted/60 px-3 py-2">
                {group}
              </p>
              <AnimatePresence initial={false}>
                {items.map((conv) => (
                  <SidebarItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeId}
                    onSelect={() => { onSelectConversation(conv.id); onClose(); }}
                    onDelete={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
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
      {/* ── Desktop sidebar (always visible) ── */}
      <aside className="hidden md:flex flex-col w-[280px] shrink-0 h-full border-r border-neutral-w-400 dark:border-dark-border/40">
        <SidebarContent />
      </aside>

      {/* ── Mobile: backdrop + slide-in drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Individual sidebar item ─────────────────────────────────
interface SidebarItemProps {
  conv: NoroChatConversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ conv, isActive, onSelect, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -8, height: 0, marginBottom: 0 }}
    transition={{ duration: 0.15 }}
    className="group relative flex items-center gap-1"
  >
    <button
      onClick={onSelect}
      className={`flex-1 min-w-0 text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
        isActive
          ? 'bg-primary-500/10 dark:bg-primary-500/15 text-neutral-b-800 dark:text-dark-text-primary font-medium border-l-2 border-primary-500'
          : 'text-neutral-b-600 dark:text-dark-text-secondary hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary'
      }`}
    >
      <span className="block truncate leading-tight">{conv.title}</span>
    </button>

    {/* Delete button — sibling (NOT nested), appears on group hover */}
    <button
      onClick={onDelete}
      className="opacity-0 group-hover:opacity-100 shrink-0 w-6 h-6 rounded flex items-center justify-center text-neutral-b-400 dark:text-dark-text-muted hover:text-semantic-r-800 dark:hover:text-semantic-r-700 hover:bg-semantic-r-700/10 transition-all duration-150 mr-1"
      title="Delete conversation"
    >
      <X size={12} />
    </button>
  </motion.div>
);

export default NoroChatSidebar;
