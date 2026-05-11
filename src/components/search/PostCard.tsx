import React from 'react';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: {
    id: string;
    content?: string;
    authorId?: string;
    authorName?: string;
    createdAt?: string;
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      {/* Author info */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {(post.authorName || 'Unknown').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {post.authorName || 'Unknown Author'}
            </h4>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Post content */}
      <div className="text-sm text-gray-700">
        {post.content ? (
          <p className="line-clamp-3">{post.content}</p>
        ) : (
          <p className="text-gray-400 italic">No content available</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
        <Link 
          to={`/post/${post.id}`}
          className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
        >
          View post
        </Link>
        
        <Link 
          to={`/profile/${post.authorId}`}
          className="text-xs text-gray-500 hover:text-gray-600 transition-colors"
        >
          View profile
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
