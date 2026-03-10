import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import CommentItem from './CommentItem';
import CommentSkeleton from './CommentSkeleton';
import { useCreateCommentMutation, useGetPostCommentsQuery } from '../../store/slices/comment/commentApi';
import type { RootState } from '../../store/store';
import type { Comment } from '../../store/slices/comment/commentApi';

interface CommentSectionProps {
    postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
    const { user } = useSelector((state: RootState) => state.auth);

    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
    const { data: commentsData, isLoading: isLoadingComments } = useGetPostCommentsQuery({ postId });

    // Get current post comments from API data
    const currentComments = Array.isArray(commentsData?.data) ? commentsData.data : [];

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && user) {
            setIsSubmittingComment(true);
            try {
                await createComment({
                    postId,
                    data: { content: newComment.trim() },
                }).unwrap();

                setNewComment('');
            } catch (error) {
                console.error('Failed to create comment:', error);
            } finally {
                setIsSubmittingComment(false);
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitComment(e as any);
        }
    };


    return (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg">

            {/* Add Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-4">
                <div className="flex gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-neutral-w-300 dark:bg-dark-bg-tertiary flex items-center justify-center shrink-0">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary-500"></div>
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={user ? "Add a comment..." : "Sign in to comment..."}
                            disabled={!user}
                            className="w-full px-2 py-1.5 text-xs sm:text-sm border border-neutral-w-400 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            rows={1}
                        />
                        <div className="flex justify-end mt-1">
                            <button
                                type="submit"
                                disabled={!newComment.trim() || !user || isCreating}
                                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-w-400 dark:disabled:bg-dark-border rounded-full transition-colors"
                            >
                                <Send className="w-3 h-3" />
                                Comment
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
                {isLoadingComments ? (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                            Loading comments...
                        </p>
                    </div>
                ) : currentComments.length === 0 && !isSubmittingComment ? (
                    <div className="text-center py-4">
                        <MessageCircle className="w-8 h-8 text-neutral-b-300 dark:text-dark-text-muted mx-auto mb-2" />
                        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                            No comments yet. Be the first to comment!
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Show skeleton when submitting a new comment */}
                        {isSubmittingComment && <CommentSkeleton />}

                        {/* Render existing comments */}
                        {currentComments.map((comment: Comment, index: number) => {
                            if (!comment) {
                                console.warn('Null comment found at index:', index);
                                return null; // Skip null comments
                            }

                            // Use comment.id as the primary key, fallback to index only if needed
                            const commentKey = comment.id || `comment-${index}`;

                            return (
                                <CommentItem
                                    key={commentKey}
                                    comment={comment}
                                    postId={postId}
                                />
                            );
                        })}

                        {/* Show empty state when no comments but not submitting */}
                        {currentComments.length === 0 && !isSubmittingComment && (
                            <div className="text-center py-4">
                                <MessageCircle className="w-8 h-8 text-neutral-b-300 dark:text-dark-text-muted mx-auto mb-2" />
                                <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                                    No comments yet. Be the first to comment!
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
