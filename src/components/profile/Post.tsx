import React, { useState } from 'react';
import { User, Heart, MessageCircle, Bookmark, MoreHorizontal } from 'lucide-react';

interface PostProps {
    post: {
        id: number;
        author: string;
        role: string;
        time: string;
        content: string;
        likes: number;
        comments: number;
        image?: string | null;
    };
}

const Post: React.FC<PostProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-300 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-neutral-b-900">{post.author}</h3>
                        <p className="text-xs text-neutral-b-500 mt-0.5">{post.role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs text-neutral-b-400">{post.time}</span>
                    <button className="text-neutral-b-400 hover:text-neutral-b-700 p-0.5 sm:p-1 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Post Content */}
            <p className="text-xs sm:text-sm text-neutral-b-700 mb-2 sm:mb-3 leading-relaxed">{post.content}</p>

            {/* Post Image */}
            {post.image && (
                <div className="rounded-md sm:rounded-lg overflow-hidden mb-2 sm:mb-3 bg-neutral-w-300">
                    <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-40 sm:h-48 md:h-64 object-cover"
                    />
                </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-neutral-w-400">
                <div className="flex items-center gap-4 sm:gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 sm:gap-2 transition-colors ${isLiked ? 'text-semantic-r-900' : 'text-neutral-b-500 hover:text-semantic-r-900'
                            }`}
                    >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-xs sm:text-sm font-medium">{likeCount}</span>
                    </button>
                    <button className="flex items-center gap-1.5 sm:gap-2 text-neutral-b-500 hover:text-primary-600 transition-colors">
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-xs sm:text-sm font-medium">{post.comments}</span>
                    </button>
                </div>
                <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`transition-colors ${isSaved ? 'text-primary-600' : 'text-neutral-b-500 hover:text-primary-600'
                        }`}
                >
                    <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
            </div>
        </div>
    );
};

export default Post;