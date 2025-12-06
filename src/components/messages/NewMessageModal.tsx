import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
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

    const filteredPeople = availablePeople.filter((person) =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectPerson = (id: string) => {
        onSelectPerson(id);
        setSearchQuery('');
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
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm overflow-hidden"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{
                            type: "spring",
                            duration: 0.4,
                            bounce: 0.3
                        }}
                        className="w-full sm:max-w-md min-h-[400px] max-h-[90vh] sm:max-h-[600px] bg-white dark:bg-dark-bg-secondary rounded-t-2xl sm:rounded-xl shadow-xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-neutral-w-400 dark:border-dark-border shrink-0">
                            <h2 className="text-base sm:text-lg font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                                New Message
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="p-1.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                            </motion.button>
                        </div>

                        {/* Search Input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-3 sm:p-4 border-b border-neutral-w-400 dark:border-dark-border shrink-0"
                        >
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-400 dark:text-dark-text-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="New message to:"
                                    autoFocus
                                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-neutral-w-100 dark:bg-dark-bg-primary border border-neutral-w-400 dark:border-dark-border rounded-lg text-sm text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-shadow"
                                />
                            </div>
                        </motion.div>

                        {/* People List */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.15
                                                }
                                            }
                                        }}
                                    >
                                        {filteredPeople.map((person) => (
                                            <motion.button
                                                key={person.id}
                                                variants={{
                                                    hidden: { opacity: 0, x: -20 },
                                                    visible: { opacity: 1, x: 0 }
                                                }}
                                                onClick={() => handleSelectPerson(person.id)}
                                                className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary transition-colors text-left"
                                            >
                                                <img
                                                    src={person.avatar}
                                                    alt={person.name}
                                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">
                                                        {person.name}
                                                    </h3>
                                                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted truncate">
                                                        {person.role}
                                                    </p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="no-results"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="p-6 sm:p-8 text-center"
                                    >
                                        <p className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">
                                            No people found
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewMessageModal;
