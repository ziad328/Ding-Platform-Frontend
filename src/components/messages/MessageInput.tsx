import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Mic, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { toast } from 'sonner';
import { useSendMessageMutation, useSendMessageWithMediaMutation } from '../../store/slices/chat';
import { useDarkMode } from '../../hook/useDarkMode';

// Message input with emoji picker, file attachments, and send functionality

interface AttachedFile {
    file: File;
    type: 'image' | 'video';
    preview: string;
}

interface MessageInputProps {
    roomId: string;
    onSendMessage?: (message: string, attachments?: AttachedFile[]) => void;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PHOTOS = 5;
const MAX_VIDEOS = 2;

const MessageInput: React.FC<MessageInputProps> = ({ roomId, onSendMessage }) => {
    const { isDarkMode } = useDarkMode();
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [sendMessageMutation, { isLoading: isSendingText }] = useSendMessageMutation();
    const [sendMessageWithMediaMutation, { isLoading: isSendingMedia }] = useSendMessageWithMediaMutation();
    const isSending = isSendingText || isSendingMedia;

    const showToast = (message: string) => {
        toast.error(message, { id: message, duration: 4000, dismissible: true });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSend = async () => {
        if (isSending || (!message.trim() && attachedFiles.length === 0)) return;

        try {
            const trimmedMessage = message.trim();

            const sentMessage =
                attachedFiles.length > 0
                    ? await (async () => {
                          const formData = new FormData();
                          formData.append('content', trimmedMessage || 'Shared media');

                          const images = attachedFiles.filter((f) => f.type === 'image');
                          images.forEach((img) => formData.append('images', img.file));

                          const videos = attachedFiles.filter((f) => f.type === 'video');
                          videos.forEach((vid) => formData.append('videos', vid.file));

                          return await sendMessageWithMediaMutation({ roomId, formData }).unwrap();
                      })()
                    : await sendMessageMutation({ roomId, content: trimmedMessage }).unwrap();

            void sentMessage;

            setMessage('');
            attachedFiles.forEach(f => URL.revokeObjectURL(f.preview));
            setAttachedFiles([]);

            if (onSendMessage) {
                onSendMessage(message, attachedFiles.length > 0 ? attachedFiles : undefined);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message. Please try again.');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEmojiClick = (emojiObject: { emoji: string }) => {
        const textarea = textareaRef.current;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newMessage = message.substring(0, start) + emojiObject.emoji + message.substring(end);
            setMessage(newMessage);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + emojiObject.emoji.length;
                textarea.focus();
            }, 0);
        } else {
            setMessage(prev => prev + emojiObject.emoji);
        }
    };

    const handleAttachClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const currentPhotos = attachedFiles.filter(f => f.type === 'image').length;
        const currentVideos = attachedFiles.filter(f => f.type === 'video').length;

        let newPhotos = 0;
        let newVideos = 0;
        const validFiles: AttachedFile[] = [];

        Array.from(files).forEach(file => {
            if (file.size > MAX_FILE_SIZE) {
                showToast(`${file.name} exceeds 20MB limit`);
                return;
            }

            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (isImage && !['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                showToast(`${file.name} - only PNG and JPEG are allowed`);
                return;
            }

            if (isVideo && file.type !== 'video/mp4') {
                showToast(`${file.name} - only MP4 videos are allowed`);
                return;
            }

            if (isImage) {
                if (currentPhotos + newPhotos >= MAX_PHOTOS) {
                    showToast(`Maximum ${MAX_PHOTOS} photos allowed`);
                    return;
                }
                newPhotos++;
                validFiles.push({ file, type: 'image', preview: URL.createObjectURL(file) });
            } else if (isVideo) {
                if (currentVideos + newVideos >= MAX_VIDEOS) {
                    showToast(`Maximum ${MAX_VIDEOS} videos allowed`);
                    return;
                }
                newVideos++;
                validFiles.push({ file, type: 'video', preview: URL.createObjectURL(file) });
            } else {
                showToast(`${file.name} is not a supported file type`);
            }
        });

        setAttachedFiles(prev => [...prev, ...validFiles]);
        e.target.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachedFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const canSend = (message.trim().length > 0 || attachedFiles.length > 0) && !isSending;

    return (
        <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3">
            <AnimatePresence>
                {attachedFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap sm:flex-nowrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-w-400 dark:scrollbar-thumb-dark-border"
                    >
                        {attachedFiles.map((file, index) => (
                            <motion.div key={index} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative shrink-0">
                                {file.type === 'image' ? (
                                    <img src={file.preview} alt="Attachment" className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover rounded-md sm:rounded-lg" />
                                ) : (
                                    <video src={file.preview} className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover rounded-md sm:rounded-lg" />
                                )}
                                <button onClick={() => removeAttachment(index)} className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold hover:bg-red-600 transition-colors shadow-sm">×</button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="relative shrink-0 hidden sm:block" ref={emojiPickerRef}>
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 sm:p-2 text-neutral-b-500 dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors" aria-label="Add emoji" disabled={isSending}>
                        <Smile className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <AnimatePresence>
                        {showEmojiPicker && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} transition={{ duration: 0.15 }} className="absolute bottom-full left-0 mb-2 z-50">
                                <EmojiPicker onEmojiClick={handleEmojiClick} theme={isDarkMode ? Theme.DARK : Theme.LIGHT} width={280} height={350} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 flex items-center bg-white dark:bg-dark-bg-primary rounded-full border border-neutral-w-400 dark:border-dark-border px-3 sm:px-4 py-1.5 sm:py-2 min-w-0">
                    <textarea ref={textareaRef} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyPress} placeholder="Type a message..." rows={1} disabled={isSending} className="flex-1 bg-transparent text-sm text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted focus:outline-none resize-none max-h-20 min-w-0 disabled:opacity-50" style={{ lineHeight: '1.4' }} />
                    <button onClick={handleAttachClick} className="ml-2 p-1 text-neutral-b-400 dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors shrink-0 disabled:opacity-50" aria-label="Attach file" disabled={isSending}>
                        <Paperclip className="w-5 h-5" />
                    </button>
                </div>

                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,video/mp4" multiple onChange={handleFileChange} className="hidden" />

                <motion.button onClick={canSend ? handleSend : undefined} className="p-2 sm:p-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-colors shrink-0 disabled:opacity-50" aria-label={canSend ? 'Send message' : 'Voice message'} whileTap={{ scale: 0.95 }} disabled={isSending}>
                    <AnimatePresence mode="wait" initial={false}>
                        {isSending ? (
                            <motion.div key="loading" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            </motion.div>
                        ) : canSend ? (
                            <motion.div key="send" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.div>
                        ) : (
                            <motion.div key="mic" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -90 }} transition={{ duration: 0.15 }}>
                                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </div>
    );
};

export default MessageInput;
