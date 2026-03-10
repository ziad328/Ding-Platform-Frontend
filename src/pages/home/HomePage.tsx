import PostCreation from '../../components/home/PostCreation';
import FeedPosts from '../../components/home/FeedPosts';
import SuggestedFriends from '../../components/profile/SuggestedFriends';

const HomePage = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-16">
                {/* Main Feed - Full width on mobile, 8 cols on desktop */}
                <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                    <PostCreation />
                    <FeedPosts />
                </div>

                {/* Right Sidebar - Hidden on mobile, visible on large screens */}
                <aside className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-6">
                        <SuggestedFriends />
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default HomePage;