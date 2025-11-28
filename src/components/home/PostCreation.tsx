import { useState, useRef } from 'react';
import { Image, Send, X, Play } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';

interface MediaFile {
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
        setLimitMessage(''); // Clear any previous messages

        files.forEach(file => {
            // Check if file is image or video
            const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

            const isImage = validImageTypes.includes(file.type);
            const isVideo = validVideoTypes.includes(file.type);

            if (!isImage && !isVideo) {
                setLimitMessage('Please select valid image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, OGG) files.');
                return;
            }

            // Count current images and videos
            const currentImages = mediaFiles.filter(m => m.type === 'image').length;
            const currentVideos = mediaFiles.filter(m => m.type === 'video').length;

            // Check limits
            if (isImage && currentImages >= 5) {
                setLimitMessage('Maximum of 5 photos reached. Remove a photo to add more.');
                return;
            }
            if (isVideo && currentVideos >= 3) {
                setLimitMessage('Maximum of 3 videos reached. Remove a video to add more.');
                return;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaFiles(prev => [...prev, {
                    file,
                    preview: reader.result as string,
                    type: isImage ? 'image' : 'video'
                }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemoveMedia = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
        setLimitMessage(''); // Clear message when removing
    };

    return (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm p-3 mb-3 sm:rounded-xl sm:p-4 md:p-5">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mt-2 sm:mt-3">
                <div className="flex items-center gap-2 flex-wrap overflow-x-auto">
                    <button
                        onClick={handleMediaClick}
                        disabled={isLimitReached}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors sm:gap-2 sm:px-3 sm:py-2 shrink-0 ${isLimitReached
                                ? 'bg-neutral-w-300 dark:bg-dark-bg-tertiary text-neutral-b-400 dark:text-dark-text-muted cursor-not-allowed'
                                : 'hover:bg-neutral-w-300 dark:hover:bg-dark-bg-tertiary'
                            }`}
                    >
                        <Image className={`w-4 h-4 sm:w-5 sm:h-5 ${isLimitReached ? 'text-neutral-b-400 dark:text-dark-text-muted' : 'text-primary-600 dark:text-primary-400'}`} />
                        <span className={`text-xs font-medium sm:text-sm ${isLimitReached ? 'text-neutral-b-400 dark:text-dark-text-muted' : 'text-neutral-b-700 dark:text-dark-text-secondary'}`}>
                            Add Media
                        </span>
                    </button>

                    {/* Media Preview Thumbnails */}
                    {mediaFiles.map((media, index) => (
                        <div key={index} className="relative w-12 h-12 sm:w-15 sm:h-15 rounded-lg overflow-hidden group shrink-0">
                            {media.type === 'video' ? (
                                <>
                                    <video
                                        src={media.preview}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Video indicator badge */}
                                    <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 bg-neutral-b-900/80 dark:bg-dark-bg-primary/80 rounded-full p-0.5 sm:p-1">
                                        <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white" />
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={media.preview}
                                    alt={`Upload preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {/* Remove button - appears on hover */}
                            <button
                                onClick={() => handleRemoveMedia(index)}
                                className="absolute inset-0 bg-neutral-b-900/80 dark:bg-dark-bg-primary/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                aria-label="Remove media"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handlePost}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors sm:gap-2 sm:px-4 sm:py-2 shrink-0 ${!postContent.trim() && mediaFiles.length === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="text-xs font-semibold sm:text-sm">Post</span>
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>
        </div>
    );
};

export default PostCreation;
