import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import CommentItem from './CommentItem';

interface Comment {
    id: string;
    author: string;
    time: string;
    content: string;
    likes: number;
    dislikes: number;
    replies?: Comment[];
}

interface CommentSectionProps {
    comments: Comment[];
    onAddComment: (content: string, parentId?: string) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmitComment(e as any);
        }
    };

    const handleReply = (commentId: string, content: string) => {
        onAddComment(content, commentId);
    };

    return (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg">
            {/* Comment Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-4 h-4 text-neutral-b-700 dark:text-dark-text-primary" />
                <h3 className="text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                    Comments ({comments.length})
                </h3>
            </div>

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
                            placeholder="Add a comment..."
                            className="w-full px-2 py-1.5 text-xs sm:text-sm border border-neutral-w-400 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-tertiary text-neutral-b-900 dark:text-dark-text-primary placeholder-neutral-b-400 dark:placeholder-dark-text-muted resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            rows={1}
                        />
                        <div className="flex justify-end mt-1">
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
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
                {comments.length === 0 ? (
                    <div className="text-center py-4">
                        <MessageCircle className="w-8 h-8 text-neutral-b-300 dark:text-dark-text-muted mx-auto mb-2" />
                        <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted">
                            No comments yet. Be the first to comment!
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={handleReply}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
