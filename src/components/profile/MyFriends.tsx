import { User, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MyFriendsProps {
    friendsCount?: number;
    isStatsLoading?: boolean;
}

const MyFriends = ({ friendsCount, isStatsLoading }: MyFriendsProps) => {
    const friends = [
        { name: 'Robert Fox', role: 'Software Engineer' },
        { name: 'Courtney Henry', role: 'Product Designer' },
        { name: 'Esther Howard', role: 'Marketing Strategist' },
        { name: 'Devon Lane', role: 'Data Analyst' },
    ];

    const friendsLabel = isStatsLoading ? '...' : friendsCount ?? 0;

    return (
        <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-semibold text-neutral-b-900 dark:text-dark-text-primary">
                    My Friends
                </h3>
                <span className="text-xs sm:text-sm text-neutral-b-500 dark:text-dark-text-muted">
                    {friendsLabel}
                </span>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
                {friends.map((friend, index) => (
                    <div key={index} className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-200 dark:bg-dark-bg-tertiary flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500 dark:text-dark-text-muted" />
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <h4 className="text-xs sm:text-sm font-medium text-neutral-b-900 dark:text-dark-text-primary truncate">{friend.name}</h4>
                                <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-0.5 truncate">{friend.role}</p>
                            </div>
                        </div>
                        <button className="inline-flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 text-xs sm:text-sm font-medium transition-colors shrink-0">
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Message</span>
                        </button>
                    </div>
                ))}
            </div>
            <div className="pt-2 border-t border-neutral-w-300 dark:border-dark-border">
                <Link
                    to="/profile/friends"
                    className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 transition-colors"
                >
                    View all friends
                </Link>
            </div>
        </div>
    );
};

export default MyFriends;


