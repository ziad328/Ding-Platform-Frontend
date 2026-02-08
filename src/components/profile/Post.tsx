import React, { useState } from 'react';
import { User, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';
import CommentSection from './CommentSection';

interface PostProps {
    post: {
        id: string;
        author: string;
        time: string;
        content: string;
        likes: number;
        comments: number;
        image: string | null;
    };
    comments?: {
        id: string;
        author: string;
        time: string;
        content: string;
        likes: number;
        dislikes: number;
        replies?: any[];
    }[];
}

interface Comment {
    id: string;
    author: string;
    time: string;
    content: string;
    likes: number;
    dislikes: number;
    replies?: Comment[];
}

const Post: React.FC<PostProps> = ({ post, comments = [] }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);
    const commentCount = post.comments;
    const [showComments, setShowComments] = useState(false);
    const [commentsList, setCommentsList] = useState(comments);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleCommentClick = () => {
        setShowComments(!showComments);
    };

    const handleAddComment = (content: string, parentId?: string) => {
        const newComment: Comment = {
            id: Date.now().toString(),
            author: 'Current User',
            time: new Date().toISOString(),
            content,
            likes: 0,
            dislikes: 0
        };

        if (parentId) {
            const addReplyToComment = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newComment]
                        };
                    } else if (comment.replies) {
                        return {
                            ...comment,
                            replies: addReplyToComment(comment.replies)
                        };
                    }
                    return comment;
                });
            };
            setCommentsList(addReplyToComment(commentsList));
        } else {
            setCommentsList([newComment, ...commentsList]);
        }
    };

    // Format the date to a relative time string
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
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-300 dark:bg-dark-bg-tertiary flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500 dark:text-dark-text-muted" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-neutral-b-900 dark:text-dark-text-primary">{post.author}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs text-neutral-b-400 dark:text-dark-text-muted">{formatTime(post.time)}</span>
                    <button className="text-neutral-b-400 dark:text-dark-text-muted hover:text-neutral-b-700 dark:hover:text-dark-text-secondary p-0.5 sm:p-1 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Post Content */}
            <p className="text-xs sm:text-sm text-neutral-b-700 dark:text-dark-text-secondary mb-2 sm:mb-3 leading-relaxed">{post.content}</p>

            {/* Post Media */}
            {post.image && (
                <div className="rounded-md sm:rounded-lg overflow-hidden mb-2 sm:mb-3 bg-neutral-w-300 dark:bg-dark-bg-tertiary">
                    <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-40 sm:h-48 md:h-64 object-cover"
                    />
                </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-neutral-w-400 dark:border-dark-border">
                <div className="flex items-center gap-4 sm:gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 sm:gap-2 transition-colors ${isLiked ? 'text-semantic-r-900 dark:text-semantic-r-700' : 'text-neutral-b-500 dark:text-dark-text-muted hover:text-semantic-r-900 dark:hover:text-semantic-r-700'
                            }`}
                    >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs sm:text-sm font-medium">{likeCount}</span>
                    </button>
                    <button 
                        onClick={handleCommentClick}
                        className="flex items-center gap-1.5 sm:gap-2 text-neutral-b-500 dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm font-medium">{commentCount}</span>
                    </button>
                </div>
                <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`transition-colors ${isSaved ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-b-500 dark:text-dark-text-muted hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                >
                    <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-neutral-w-400 dark:border-dark-border">
                    <CommentSection
                        comments={commentsList}
                        onAddComment={handleAddComment}
                    />
                </div>
            )}
        </div>
    );
};

export default Post;