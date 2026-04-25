import React, { useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useCreateRoomMutation } from '../../store/slices/chat';
import type { ChatRoom } from '../../store/slices/chat/types';
import { useGetFriendsQuery } from '../../store/slices/social/friends/friendsApi';

// Modal for creating new conversations with friends


interface Friend {
    id: string;
    name: string;
    username?: string;
    avatar: string;
    email?: string;
}

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPerson: (id: string) => void;
    onRoomCreated?: (room: ChatRoom) => void;
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ isOpen, onClose, onSelectPerson, onRoomCreated }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { isLoading: isFriendsLoading } = useGetFriendsQuery();
    const friendsList = useSelector((state: RootState) => state.friends?.list);

    const friends = useMemo(() =>
        (friendsList || []).map((friend) => ({
            id: friend.userId,
            name: friend.user?.name || 'Unknown',
            username: undefined,
            avatar: friend.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.user?.name || 'U')}&background=random`,
            email: undefined,
        })),
        [friendsList]
    );

    const [createRoom, { isLoading }] = useCreateRoomMutation();

    const filteredPeople = friends.filter((person: Friend) =>
        person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (person.username && person.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleSelectPerson = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleStartChat = async () => {
        if (selectedIds.length === 0 || isLoading) return;

        try {
            const roomType = selectedIds.length === 1 ? 'DIRECT' : 'GROUP';
            const response = await createRoom({
                memberIds: selectedIds,
                type: roomType,
                name: roomType === 'GROUP' ? 'New Group' : undefined,
            }).unwrap();

            if (onRoomCreated) {
                onRoomCreated(response);
            } else {
                onSelectPerson(response.id);
            }

            setSearchQuery('');
            setSelectedIds([]);
            onClose();
        } catch (error) {
            console.error('Failed to create room:', error);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSelectedIds([]);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-hidden" onClick={handleClose}>
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: "spring", duration: 0.4, bounce: 0.25 }} className="w-full max-w-md mx-4 bg-neutral-w-100 dark:bg-dark-bg-secondary rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'min(500px, 80vh)' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center relative px-4 py-3 border-b border-neutral-w-400 dark:border-dark-border/40 shrink-0">
                            <h2 className="text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary">New message</h2>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleClose} className="absolute right-3 p-1.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary rounded-full transition-colors" aria-label="Close">
                                <X className="w-5 h-5 text-neutral-b-700 dark:text-dark-text-primary" />
                            </motion.button>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-w-400 dark:border-dark-border/40 shrink-0">
                            <span className="text-base font-medium text-neutral-b-900 dark:text-dark-text-primary shrink-0">To:</span>
                            {selectedIds.length > 0 && <span className="text-sm text-primary-600 dark:text-primary-400">{selectedIds.length} selected</span>}
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." autoFocus className="flex-1 bg-transparent text-sm text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted focus:outline-none" />
                        </div>

                        <div className="px-4 py-3 shrink-0">
                            <span className="text-sm font-semibold text-neutral-b-700 dark:text-dark-text-secondary">
                                {isFriendsLoading ? 'Loading friends...' : friends.length > 0 ? 'Suggested' : 'No friends yet'}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto thin-scrollbar">
                            <AnimatePresence mode="wait">
                                {filteredPeople.length > 0 ? (
                                    <motion.div key="people-list" initial="hidden" animate="visible" exit="hidden" variants={{ visible: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } } }}>
                                        {filteredPeople.map((person: Friend) => (
                                            <motion.button key={person.id} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }} onClick={() => handleSelectPerson(person.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary transition-colors text-left">
                                                <img src={person.avatar} alt={person.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary truncate">{person.name}</h3>
                                                    <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted truncate">{person.username || person.email}</p>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selectedIds.includes(person.id) ? 'border-primary-500 bg-primary-500' : 'border-neutral-b-300 dark:border-dark-text-muted'}`}>
                                                    {selectedIds.includes(person.id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div key="no-results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="p-6 text-center">
                                        <p className="text-sm text-neutral-b-500 dark:text-dark-text-muted">{friends.length === 0 ? 'Add friends to start chatting' : 'No people found'}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-4 shrink-0">
                            <motion.button whileHover={{ scale: selectedIds.length > 0 && !isLoading ? 1.02 : 1 }} whileTap={{ scale: selectedIds.length > 0 && !isLoading ? 0.98 : 1 }} onClick={handleStartChat} disabled={selectedIds.length === 0 || isLoading} className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${selectedIds.length > 0 && !isLoading ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer' : 'bg-primary-600/50 text-white/70 cursor-not-allowed'}`}>
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : 'Chat'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NewMessageModal;
