import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Conversation } from './ConversationItem';

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPerson: (id: string) => void;
    availablePeople: Conversation[];
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({
    isOpen,
    onClose,
    onSelectPerson,
    availablePeople,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filteredPeople = availablePeople.filter((person) =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.username && person.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelectPerson = (id: string) => {
        setSelectedId(id === selectedId ? null : id);
    };

    const handleStartChat = () => {
        if (selectedId) {
            onSelectPerson(selectedId);
            setSearchQuery('');
            setSelectedId(null);
            onClose();
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedId(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{
                            type: "spring",
                            duration: 0.4,
                            bounce: 0.25
                        }}
                        className="w-full max-w-md mx-4 bg-neutral-w-100 dark:bg-dark-bg-secondary rounded-xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ maxHeight: 'min(500px, 80vh)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-center relative px-4 py-3 border-b border-neutral-w-400 dark:border-dark-border/40 shrink-0">
                            <h2 className="text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                                New message
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClose}
                                className="absolute right-3 p-1.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                            </motion.button>
                        </div>

                        {/* Search Input with "To:" label */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-w-400 dark:border-dark-border/40 shrink-0">
                            <span className="text-base font-medium text-neutral-b-900 dark:text-dark-text-primary shrink-0">
                                To:
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                autoFocus
                                className="flex-1 bg-transparent text-sm text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted focus:outline-none"
                            />
                        </div>

                        {/* Suggested Label */}
                        <div className="px-4 py-3 shrink-0">
                            <span className="text-sm font-semibold text-neutral-b-700 dark:text-dark-text-secondary">
                                Suggested
                            </span>
                        </div>

                        {/* People List */}
                        <div className="flex-1 overflow-y-auto thin-scrollbar">
                            <AnimatePresence mode="wait">
                                {filteredPeople.length > 0 ? (
                                    <motion.div
                                        key="people-list"
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        variants={{
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.03,
                                                    delayChildren: 0.1
                                                }
                                            }
                                        }}
                                    >
                                        {filteredPeople.map((person) => (
                                            <motion.button
                                                key={person.id}
                                                variants={{
                                                    hidden: { opacity: 0, x: -10 },
                                                    visible: { opacity: 1, x: 0 }
                                                }}
                                                onClick={() => handleSelectPerson(person.id)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary transition-colors text-left"
                                            >
                                                <img
                                                    src={person.avatar}
                                                    alt={person.name}
                                                    className="w-11 h-11 rounded-full object-cover shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">
                                                        {person.name}
                                                    </h3>
                                                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted truncate">
                                                        {person.username || person.role}
                                                    </p>
                                                </div>
                                                {/* Selection Circle */}
                                                <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selectedId === person.id
                                                    ? 'border-primary-500 bg-primary-500'
                                                    : 'border-neutral-b-300 dark:border-dark-text-muted'
                                                    }`}>
                                                    {selectedId === person.id && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="w-2 h-2 bg-white rounded-full"
                                                        />
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="no-results"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-6 text-center"
                                    >
                                        <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">
                                            No people found
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Chat Button */}
                        <div className="p-4 shrink-0">
                            <motion.button
                                whileHover={{ scale: selectedId ? 1.02 : 1 }}
                                whileTap={{ scale: selectedId ? 0.98 : 1 }}
                                onClick={handleStartChat}
                                disabled={!selectedId}
                                className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${selectedId
                                    ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
                                    : 'bg-primary-600/50 text-white/70 cursor-not-allowed'
                                    }`}
                            >
                                Chat
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewMessageModal;
