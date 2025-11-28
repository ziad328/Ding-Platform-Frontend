import PostCreation from '../../components/home/PostCreation';
import FeedPosts from '../../components/home/FeedPosts';
import SuggestedFriends from '../../components/profile/SuggestedFriends';

const HomePage = () => {
    return (
        <div className="w-full mx-auto mb-4 sm:mb-6 md:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
            <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 lg:gap-4">
                {/* Center Feed - Main Content */}
                <div className="w-full lg:col-span-2">
                    <PostCreation />
                    <FeedPosts />
                </div>

                {/* Right Sidebar - Suggested Friends - Hidden on mobile */}
                <div className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-0 xl:ml-10">
                        <SuggestedFriends />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;