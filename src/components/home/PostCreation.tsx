import { useState, useRef } from 'react';
import { Image, Send, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';
import MediaCarousel from '../common/MediaCarousel';

interface MediaFile {
    id: string;
    file: File;
    preview: string;
    type: 'image' | 'video';
}

const PostCreation = () => {
    const [postContent, setPostContent] = useState('');
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [limitMessage, setLimitMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const user = useSelector(selectCurrentUser);

    const imageCount = mediaFiles.filter(m => m.type === 'image').length;
    const videoCount = mediaFiles.filter(m => m.type === 'video').length;
    const isLimitReached = imageCount >= 5 && videoCount >= 3;

    const handlePost = () => {
        if (postContent.trim() || mediaFiles.length > 0) {
            // TODO: Implement post creation logic with media
            console.log('Creating post:', { content: postContent, media: mediaFiles.map(m => m.file) });
            setPostContent('');
            setMediaFiles([]);
            setLimitMessage('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePost();
        }
    };

    const handleMediaClick = () => {
        if (!isLimitReached) {
            fileInputRef.current?.click();
        }
    };

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setLimitMessage('');

        files.forEach(file => {
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

            const isImage = validImageTypes.includes(file.type);
            const isVideo = validVideoTypes.includes(file.type);

            if (!isImage && !isVideo) {
                setLimitMessage('Please select valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG) files.');
                return;
            }

            const currentImages = mediaFiles.filter(m => m.type === 'image').length;
            const currentVideos = mediaFiles.filter(m => m.type === 'video').length;

            if (isImage && currentImages >= 5) {
                setLimitMessage('Maximum of 5 photos reached. Remove a photo to add more.');
                return;
            }
            if (isVideo && currentVideos >= 3) {
                setLimitMessage('Maximum of 3 videos reached. Remove a video to add more.');
                return;
            }


            const reader = new FileReader();
            const uniqueId = crypto.randomUUID(); // Generate ID before async operation
            reader.onloadend = () => {
                setMediaFiles(prev => {
                    // Check if this file is already in the list (prevent StrictMode duplicates)
                    const isDuplicate = prev.some(media =>
                        media.file.name === file.name &&
                        media.file.size === file.size &&
                        media.file.lastModified === file.lastModified
                    );

                    if (isDuplicate) {
                        return prev; // Don't add duplicate
                    }

                    return [...prev, {
                        id: uniqueId,
                        file,
                        preview: reader.result as string,
                        type: isImage ? 'image' : 'video'
                    }];
                });
            };
            reader.readAsDataURL(file);
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveMedia = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setLimitMessage('');
    };

    return (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm p-3 mb-3 sm:rounded-xl sm:p-4 md:p-5">
            {/* Header with Avatar and Textarea */}
            <div className="flex gap-2 pb-3 items-start sm:gap-3">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center shrink-0 sm:w-10 sm:h-10">
                    <span className="text-white font-semibold text-xs sm:text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                </div>

                {/* Input Area with underline */}
                <div className="flex-1 min-w-0">
                    <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="What's on your mind?"
                        maxLength={500}
                        className="w-full resize-none border-none outline-none bg-transparent text-neutral-b-900 dark:text-dark-text-primary placeholder:text-neutral-b-400 dark:placeholder:text-dark-text-muted text-xs pt-2 sm:text-sm"
                        rows={1}
                        style={{ minHeight: '20px', maxHeight: '80px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                        }}
                    />
                    <div className="border-b border-neutral-w-400 dark:border-dark-border"></div>
                </div>
            </div>

            {/* Limit Message */}
            {limitMessage && (
                <div className="mb-2 px-3 py-2 bg-semantic-y-700/10 dark:bg-semantic-y-900/20 border border-semantic-y-700/30 dark:border-semantic-y-900/40 rounded-lg flex items-start justify-between gap-2">
                    <p className="text-xs text-semantic-y-900 dark:text-semantic-y-700 flex-1">{limitMessage}</p>
                    <button
                        onClick={() => setLimitMessage('')}
                        className="text-semantic-y-900 dark:text-semantic-y-700 hover:text-semantic-y-800 dark:hover:text-semantic-y-600 transition-colors shrink-0"
                        aria-label="Close message"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Media Carousel - Show when media files exist */}
            {mediaFiles.length > 0 && (
                <MediaCarousel
                    mediaFiles={mediaFiles}
                    onRemove={handleRemoveMedia}
                />
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/webm,video/ogg"
                onChange={handleMediaChange}
                multiple
                className="hidden"
            />

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 mt-2 sm:mt-3">
                <button
                    onClick={handleMediaClick}
                    disabled={isLimitReached}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors border sm:gap-2 sm:px-3 sm:py-2 shrink-0 ${isLimitReached
                        ? 'bg-neutral-w-300 dark:bg-dark-bg-tertiary text-neutral-b-400 dark:text-dark-text-muted border-neutral-w-400 dark:border-dark-border cursor-not-allowed'
                        : 'bg-white dark:bg-dark-bg-secondary text-neutral-b-700 dark:text-dark-text-secondary border-neutral-w-400 dark:border-dark-border hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary cursor-pointer'
                        }`}
                >
                    <Image className={`w-4 h-4 sm:w-5 sm:h-5 ${isLimitReached ? 'text-neutral-b-400 dark:text-dark-text-muted' : 'text-primary-600 dark:text-primary-400'}`} />
                    <span className={`text-xs font-medium sm:text-sm ${isLimitReached ? 'text-neutral-b-400 dark:text-dark-text-muted' : 'text-neutral-b-700 dark:text-dark-text-secondary'}`}>
                        Add Media {mediaFiles.length > 0 && `(${mediaFiles.length})`}
                    </span>
                </button>

                <button
                    onClick={handlePost}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors sm:gap-2 sm:px-4 sm:py-2 shrink-0 ${!postContent.trim() && mediaFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                    disabled={!postContent.trim() && mediaFiles.length === 0}
                >
                    <span className="text-xs font-semibold sm:text-sm">Post</span>
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>
        </div>
    );
};

export default PostCreation;
