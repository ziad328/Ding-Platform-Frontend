import { User, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyFriends = () => {
    const friends = [
        { name: 'Robert Fox', role: 'Software Engineer' },
        { name: 'Courtney Henry', role: 'Product Designer' },
        { name: 'Esther Howard', role: 'Marketing Strategist' },
        { name: 'Devon Lane', role: 'Data Analyst' },
    ];

    return (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 md:p-5 space-y-3">
            <h3 className="text-sm sm:text-base font-semibold text-neutral-b-900 mb-3 sm:mb-4">My Friends</h3>
            <div className="space-y-2.5 sm:space-y-3">
                {friends.map((friend, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-w-200 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-b-500" />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-medium text-neutral-b-900">{friend.name}</h4>
                                <p className="text-xs text-neutral-b-500 mt-0.5">{friend.role}</p>
                            </div>
                        </div>
                        <button className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium transition-colors">
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            Message
                        </button>
                    </div>
                ))}
            </div>
            <div className="pt-2 border-t border-neutral-w-300">
                <Link
                    to="/profile/friends"
                    className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                    View all friends
                </Link>
            </div>
        </div>
    );
};

export default MyFriends;


