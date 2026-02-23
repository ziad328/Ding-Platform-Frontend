import React, { useState } from 'react';
import { User, Heart, MoreHorizontal, Reply, Send, X } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useCreateCommentMutation, useUpdateCommentMutation, useDeleteCommentMutation, useGetCommentRepliesQuery, useLikeCommentMutation, useUnlikeCommentMutation } from '../../store/slices/comment/commentApi';
import { updateComment, removeComment } from '../../store/slices/comment/commentSlice';
import type { RootState } from '../../store/store';
import type { Comment } from '../../store/slices/comment/commentApi';

interface CommentItemProps {
    comment: Comment;
    postId: string;
    level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, level = 0 }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
    const [updateCommentMutation] = useUpdateCommentMutation();
    const [deleteCommentMutation] = useDeleteCommentMutation();
    const [likeComment] = useLikeCommentMutation();
    const [unlikeComment] = useUnlikeCommentMutation();

    const [isLiked, setIsLiked] = useState(comment.liked || false);
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyField, setShowReplyField] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showDropdown, setShowDropdown] = useState(false);

    // Only fetch replies when they are shown
    const { data: repliesData, isLoading: isLoadingReplies } = useGetCommentRepliesQuery({
        commentId: comment.id
    });

    const handleLike = async () => {
        if (!user) return;

        try {
            if (isLiked) {
                const result = await unlikeComment({ commentId: comment.id }).unwrap();
                console.log('Unlike result:', result);
                setIsLiked(false);
                setLikeCount(result.likesCount ?? likeCount - 1);
            } else {
                const result = await likeComment({ commentId: comment.id }).unwrap();
                console.log('Like result:', result);
                setIsLiked(true);
                setLikeCount(result.likesCount ?? likeCount + 1);
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
            // Revert state on error
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        }
    };


    const handleReply = async () => {
        setShowReplyField(!showReplyField);

        // Determine the mention
        const mention = `@${comment.author?.name || 'user'} `;

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

    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim() && user) {
            try {
                // Determine the parent comment ID
                let parentCommentId = comment.id;
                if (comment.parentCommentId) {
                    parentCommentId = comment.parentCommentId;
                }

                await createComment({
                    postId,
                    data: {
                        content: replyContent.trim(),
                        parentCommentId: parentCommentId,
                    },
                }).unwrap();

                // RTK Query will automatically invalidate and refetch replies
                // The reply will appear with its complete data from the server
                setReplyContent('');
                setShowReplyField(false);
            } catch (error) {
                console.error('Failed to create reply:', error);
            }
        }
    };

    const handleReplyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitReply(e as any);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(comment.content);
    };

    const handleSaveEdit = async () => {
        if (editContent.trim() && editContent !== comment.content) {
            try {
                await updateCommentMutation({
                    commentId: comment.id,
                    data: { content: editContent.trim() },
                }).unwrap();

                dispatch(updateComment({ commentId: comment.id, content: editContent.trim() }));
                setIsEditing(false);
            } catch (error) {
                console.error('Failed to update comment:', error);
            }
        } else {
            setIsEditing(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteCommentMutation({ commentId: comment.id }).unwrap();
                dispatch(removeComment({ commentId: comment.id }));
            } catch (error) {
                console.error('Failed to delete comment:', error);
            }
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditContent(comment.content);
    };

    const cancelReply = () => {
        setShowReplyField(false);
        setReplyContent('');
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Get current replies from API data only
    const currentReplies = Array.isArray((repliesData?.data as any)?.data) ? (repliesData?.data as any).data : [];

    const hasReplies = comment.replyCount > 0;

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 8640000);

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    const isAuthor = user?.id === comment.author?.id;

    return (
        <div className={`relative ${level > 0 && level < 2 ? 'ml-8' : ''}`}>
            {/* Connector line for nested comments - only show if they have replies and replies are visible and level < 2 */}
            {level > 0 && level < 2 && hasReplies && showReplies && (
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
                    {comment.author?.image ? (
                        <img
                            src={comment.author.image}
                            alt={comment.author.name || 'User'}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500 dark:text-dark-text-muted" />
                    )}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    {/* Comment Header */}
                    <div className="bg-neutral-w-100 dark:bg-dark-bg-secondary rounded-lg p-2 border border-neutral-w-300 dark:border-dark-border inline-block max-w-full">
                        <div className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                                    {comment.author?.name || 'Anonymous'}
                                </h4>
                                <span className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                                    {formatTime(comment.createdAt)}
                                </span>
                            </div>
                            {/* More Options */}
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary p-1 transition-colors"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                                {isAuthor && showDropdown && (
                                    <div className="absolute left-9 top-0 bg-white dark:bg-dark-bg-secondary border border-neutral-w-300 dark:border-dark-border rounded-lg shadow-lg py-1 z-10">
                                        <button
                                            onClick={handleEdit}
                                            className="block w-full text-left px-3 py-1 text-sm text-neutral-b-700 dark:text-dark-text-secondary hover:bg-neutral-w-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="block w-full text-left px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comment Text */}
                        {isEditing ? (
                            <div className="mb-2">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-neutral-w-400 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-secondary text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveEdit}
                                        disabled={!editContent.trim() || isCreating}
                                        className="px-3 py-1 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-w-400 dark:disabled:bg-dark-border rounded-full transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="px-3 py-1 text-sm font-medium text-neutral-b-600 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-secondary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-b-800 dark:text-dark-text-secondary leading-relaxed max-w-full wrap-break-word">
                                {comment.content}
                            </p>
                        )}
                    </div>
                    {/* Comment Actions */}
                    <div className="flex items-center gap-8">
                        {/* Like */}
                        <div className="flex items-center">
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1 p-1 rounded transition-colors ${isLiked
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-neutral-b-500 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span className={`text-sm ${isLiked ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-b-600 dark:text-dark-text-muted'}`}>
                                    {likeCount}
                                </span>
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


                    </div>

                    {/* Reply Field */}
                    {showReplyField && (
                        <div className="mt-3 p-3 bg-neutral-w-100 dark:bg-dark-bg-tertiary rounded-lg border border-neutral-w-300 dark:border-dark-border">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-neutral-b-700 dark:text-dark-text-secondary">
                                    Replying to @{comment.author?.name || 'user'}
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
                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors mb-4"
                            >
                                {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                            </button>

                            {showReplies && (
                                <div className="space-y-4">
                                    {isLoadingReplies ? (
                                        <div className="text-sm text-neutral-b-500 dark:text-dark-text-muted italic">
                                            Loading replies...
                                        </div>
                                    ) : currentReplies.length === 0 ? (
                                        <div className="text-sm text-neutral-b-500 dark:text-dark-text-muted italic">
                                            No replies yet.
                                        </div>
                                    ) : (
                                        currentReplies.map((reply: Comment) => (
                                            <CommentItem
                                                key={reply.id}
                                                comment={reply}
                                                postId={postId}
                                                level={Math.min(level + 1, 2)} // Cap at level 2
                                            />
                                        ))
                                    )}
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
