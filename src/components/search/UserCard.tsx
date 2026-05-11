import React from 'react';
import { Link } from 'react-router-dom';

interface UserCardProps {
  user: {
    id: string;
    name?: string;
    username?: string;
    bio?: string;
    avatar?: string;
  };
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=fff`;

  return (
    <Link 
      to={`/profile/${user.id}`}
      className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <div className="shrink-0">
          <img
            src={user.avatar || defaultAvatar}
            alt={user.name || 'User avatar'}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultAvatar;
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'Unknown User'}
            </h4>
            {user.username && (
              <span className="text-xs text-gray-500">@{user.username}</span>
            )}
          </div>
          
          {user.bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
