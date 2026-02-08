import React, { useState } from 'react';
import { User, ThumbsUp, ThumbsDown, MoreHorizontal, Reply, Send, X } from 'lucide-react';

interface CommentItemProps {
    comment: {
        id: string;
        author: string;
        time: string;
        content: string;
        likes: number;
        dislikes: number;
        replies?: CommentItemProps['comment'][];
    };
    onReply: (commentId: string, content: string) => void;
    level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply, level = 0 }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [dislikeCount, setDislikeCount] = useState(comment.dislikes);
    const [showReplies, setShowReplies] = useState(true);
    const [showReplyField, setShowReplyField] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleLike = () => {
        if (isLiked) {
            setIsLiked(false);
            setLikeCount(likeCount - 1);
        } else {
            setIsLiked(true);
            setLikeCount(likeCount + 1);
            if (isDisliked) {
                setIsDisliked(false);
                setDislikeCount(dislikeCount - 1);
            }
        }
    };

    const handleDislike = () => {
        if (isDisliked) {
            setIsDisliked(false);
            setDislikeCount(dislikeCount - 1);
        } else {
            setIsDisliked(true);
            setDislikeCount(dislikeCount + 1);
            if (isLiked) {
                setIsLiked(false);
                setLikeCount(likeCount - 1);
            }
        }
    };

    const handleReply = () => {
        setShowReplyField(!showReplyField);
        const mention = `@${comment.author} `;
        setReplyContent(mention);
        
        // Set cursor position after the mention
        setTimeout(() => {
            const textarea = document.querySelector(`[data-reply-textarea="${comment.id}"]`) as HTMLTextAreaElement;
            if (textarea) {
                textarea.focus();
                textarea.setSelectionRange(mention.length, mention.length);
            }
        }, 0);
    };

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim()) {
            onReply(comment.id, replyContent.trim());
            setReplyContent('');
            setShowReplyField(false);
        }
    };

    const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitReply(e as any);
        }
    };

    const cancelReply = () => {
        setShowReplyField(false);
        setReplyContent('');
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className={`relative ${level > 0 ? 'ml-8' : ''}`}>
            {/* Connector line for nested comments - only show if they have replies and replies are visible */}
            {level > 0 && hasReplies && showReplies && (
                <div 
                    className="absolute left-0 top-0 bottom-0 w-8 flex cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900 transition-colors"
                    onClick={() => setShowReplies(!showReplies)}
                >
                    <div className="w-0.5 bg-gray-300 dark:bg-gray-600 ml-4 hover:bg-primary-500 transition-colors group"></div>
                </div>
            )}
            
            {/* Vertical line for main comments that have replies */}
            {level === 0 && hasReplies && (
                <div 
                    className="absolute left-4 top-10 w-0.5 bg-gray-300 dark:bg-gray-600 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900 hover:bg-primary-500 transition-colors group" 
                    style={{ 
                        height: `calc(100% - 40px)`,
                        zIndex: 0
                    }}
                    onClick={() => setShowReplies(!showReplies)}
                >
                </div>
            )}
            
            <div className="flex gap-3">
                {/* User Avatar */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-300 dark:bg-dark-bg-tertiary flex items-center justify-center shrink-0 relative z-10">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500 dark:text-dark-text-muted" />
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    {/* Comment Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                            {comment.author}
                        </h4>
                        <span className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                            {formatTime(comment.time)}
                        </span>
                    </div>

                    {/* Comment Text */}
                    <p className="text-sm text-neutral-b-800 dark:text-dark-text-secondary mb-2 leading-relaxed">
                        {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4">
                        {/* Like/Dislike */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 p-1 rounded transition-colors ${
                                    isLiked
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary'
                                }`}
                            >
                                <ThumbsUp className="w-4 h-4" />
                            </button>
                            <span className={`text-sm ${isLiked ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-b-600 dark:text-dark-text-muted'}`}>
                                {likeCount}
                            </span>
                            <button
                                onClick={handleDislike}
                                className={`flex items-center gap-1 p-1 rounded transition-colors ${
                                    isDisliked
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary'
                                }`}
                            >
                                <ThumbsDown className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Reply Button */}
                        <button
                            onClick={handleReply}
                            className="flex items-center gap-1 text-sm text-neutral-b-600 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-secondary transition-colors"
                        >
                            <Reply className="w-4 h-4" />
                            Reply
                        </button>

                        {/* More Options */}
                        <button className="text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary p-1 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Reply Field */}
                    {showReplyField && (
                        <div className="mt-3 p-3 bg-neutral-w-100 dark:bg-dark-bg-tertiary rounded-lg border border-neutral-w-300 dark:border-dark-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-neutral-b-700 dark:text-dark-text-secondary">
                                    Replying to @{comment.author}
                                </span>
                                <button
                                    onClick={cancelReply}
                                    className="text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmitReply}>
                                <div className="flex gap-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-neutral-w-300 dark:bg-dark-bg-tertiary flex items-center justify-center shrink-0">
                                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            onKeyDown={handleReplyKeyDown}
                                            data-reply-textarea={comment.id}
                                            placeholder="Write a reply..."
                                            className="w-full px-3 py-2 text-sm border border-neutral-w-400 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-secondary text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            rows={2}
                                            autoFocus
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                type="submit"
                                                disabled={!replyContent.trim()}
                                                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-w-400 dark:disabled:bg-dark-border rounded-full transition-colors"
                                            >
                                                <Send className="w-3 h-3" />
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Replies Section */}
                    {hasReplies && (
                        <div className="mt-3">
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-2"
                            >
                                {showReplies ? 'Hide' : 'Show'} {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}
                            </button>
                            
                            {showReplies && (
                                <div className="space-y-4">
                                    {comment.replies?.map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            onReply={onReply}
                                            level={level + 1}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
