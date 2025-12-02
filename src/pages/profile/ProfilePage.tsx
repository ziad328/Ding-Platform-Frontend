import { useEffect, useState } from 'react';
import { MessageCircle, Bookmark } from 'lucide-react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import Post from '../../components/profile/Post';
import EmptyState from '../../components/profile/EmptyState';
import Settings from '../../components/profile/Settings';
import SuggestedFriends from '../../components/profile/SuggestedFriends';
import MyFriends from '../../components/profile/MyFriends';
import SuggestedFollowers from '../../components/profile/SuggestedFollowers';
import Footer from '../../components/profile/Footer';
import ProfileAboutCard from '../../components/profile/ProfileAboutCard';
import { useGetSocialStatsQuery } from '../../store/slices/social/stats/socialStatsApi';
import { useGetPostsCountQuery } from '../../store/slices/posts/postsStatsApi';
import {
  ProfileHeaderSkeleton,
  PostSkeleton,
  SettingsSkeleton,
} from '../../components/profile/ProfileSkeletons';
import { useGetCurrentProfileQuery } from '../../store/slices/profile/profileApi';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('My Posts');
  const [isLoading, setIsLoading] = useState(true);
  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
  } = useGetCurrentProfileQuery();
  const isProfilePending = isProfileLoading || isProfileFetching;
  const {
    data: socialStats,
    isLoading: isSocialStatsLoading,
    isFetching: isSocialStatsFetching,
  } = useGetSocialStatsQuery();
  const isStatsLoading = isSocialStatsLoading || isSocialStatsFetching;
  const {
    data: postsCountResponse,
    isLoading: isPostsCountLoading,
    isFetching: isPostsCountFetching,
  } = useGetPostsCountQuery();
  const isPostsCountPending = isPostsCountLoading || isPostsCountFetching;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const myPosts = [
    {
      id: '1',
      content: "Received a lot of questions about breaking into the tech industry lately. If you're starting out or looking to switch careers, feel free to connect with me. I'm here to help and share insights! 🚀",
      authorId: 'user-1',
      authorName: 'Robert Fox',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      mediaUrls: [],
      privacy: 'Public',
    },
    {
      id: '2',
      content: "Today marks 5 years in the software engineering field. Grateful for all the opportunities and growth along the way. Here's to many more years of coding excellence!",
      authorId: 'user-1',
      authorName: 'Robert Fox',
      createdAt: '2022-07-27T12:00:00.000Z',
      mediaUrls: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'],
      privacy: 'Public',
    },
  ];

  const savedPosts = [
    {
      id: '3',
      content: "In today's fast-paced, digitally driven world, digital marketing is not just a strategy, it's a necessity for businesses of all sizes. 🚀",
      authorId: 'user-2',
      authorName: 'Bessie Cooper',
      createdAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7 hours ago
      mediaUrls: [],
      privacy: 'Public',
    },
    {
      id: '4',
      content: "Prepare to be dazzled by our latest collection! From trendy fashion to must-have gadgets, we've got something for everyone.",
      authorId: 'user-3',
      authorName: 'Jacob Jones',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      mediaUrls: ['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800'],
      privacy: 'Public',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 mb-6 sm:mb-8">
      {/* Profile Header with Tabs - Full Width */}
      <div className="mb-3 sm:mb-4">
        {isLoading || isProfilePending ? (
          <ProfileHeaderSkeleton />
        ) : (
          <ProfileHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile ?? null}
            followersCount={socialStats?.followersCount}
            followingCount={socialStats?.followingCount}
            isStatsLoading={isStatsLoading}
            postsCount={postsCountResponse?.postsCount}
            isPostsCountLoading={isPostsCountPending}
          />
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-3 sm:space-y-4">
          {/* Tab Content */}
          <div className="space-y-3 sm:space-y-4">
            {activeTab === 'My Posts' && (
              <>
                {isLoading ? (
                  [true, false].map((withImage, index) => (
                    <PostSkeleton key={`my-post-skeleton-${index}`} withImage={withImage} />
                  ))
                ) : myPosts.length > 0 ? (
                  myPosts.map((post) => <Post key={post.id} post={post} />)
                ) : (
                  <EmptyState
                    icon={MessageCircle}
                    title="No Posts Yet"
                    description="Start sharing your thoughts with the world!"
                  />
                )}
              </>
            )}

            {activeTab === 'Saved Posts' && (
              <>
                {isLoading ? (
                  [false, true].map((withImage, index) => (
                    <PostSkeleton key={`saved-post-skeleton-${index}`} withImage={withImage} />
                  ))
                ) : savedPosts.length > 0 ? (
                  savedPosts.map((post) => <Post key={post.id} post={post} />)
                ) : (
                  <EmptyState
                    icon={Bookmark}
                    title="No Saved Posts"
                    description="Save posts you want to revisit later"
                  />
                )}
              </>
            )}

            {activeTab === 'Settings' && (isLoading ? <SettingsSkeleton /> : <Settings />)}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-3 sm:space-y-4">
          <ProfileAboutCard profile={profile ?? null} isLoading={isLoading || isProfilePending} />
          <MyFriends
            friendsCount={socialStats?.friendsCount}
            isStatsLoading={isStatsLoading}
          />
          <SuggestedFriends />
          <SuggestedFollowers />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;