import { useEffect, useState } from 'react';
import { MessageCircle, Bookmark } from 'lucide-react';
import ProfileHeader from '../../components/profile/ProfileHeader';
import Post from '../../components/profile/Post';
import EmptyState from '../../components/profile/EmptyState';
import Settings from '../../components/profile/Settings';
import SuggestedFriends from '../../components/profile/SuggestedFriends';
import SuggestedFollowers from '../../components/profile/SuggestedFollowers';
import Footer from '../../components/profile/Footer';
import {
  ProfileHeaderSkeleton,
  PostSkeleton,
  SuggestedFriendsSkeleton,
  SuggestedFollowersSkeleton,
  FooterSkeleton,
  SettingsSkeleton,
} from '../../components/profile/ProfileSkeletons';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('My Posts');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const myPosts = [
    {
      id: 1,
      author: 'Robert Fox',
      role: 'Software Engineer',
      time: '3 days ago',
      content: "Received a lot of questions about breaking into the tech industry lately. If you're starting out or looking to switch careers, feel free to connect with me. I'm here to help and share insights! 🚀",
      likes: 24,
      comments: 5,
      image: null,
    },
    {
      id: 2,
      author: 'Robert Fox',
      role: 'Software Engineer',
      time: '27 July, 2022',
      content: "Today marks 5 years in the software engineering field. Grateful for all the opportunities and growth along the way. Here's to many more years of coding excellence!",
      likes: 156,
      comments: 23,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    },
  ];

  const savedPosts = [
    {
      id: 3,
      author: 'Bessie Cooper',
      role: 'Digital Marketer',
      time: '7 hours ago',
      content: "In today's fast-paced, digitally driven world, digital marketing is not just a strategy, it's a necessity for businesses of all sizes. 🚀",
      likes: 89,
      comments: 12,
      image: null,
    },
    {
      id: 4,
      author: 'Jacob Jones',
      role: 'Sales Manager',
      time: '1 day ago',
      content: "Prepare to be dazzled by our latest collection! From trendy fashion to must-have gadgets, we've got something for everyone.",
      likes: 234,
      comments: 45,
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 mb-6 sm:mb-8">
      {/* Profile Header with Tabs - Full Width */}
      <div className="mb-3 sm:mb-4">
        {isLoading ? (
          <ProfileHeaderSkeleton />
        ) : (
          <ProfileHeader activeTab={activeTab} setActiveTab={setActiveTab} />
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
          {isLoading ? (
            <>
              <SuggestedFriendsSkeleton />
              <SuggestedFollowersSkeleton />
              <FooterSkeleton />
            </>
          ) : (
            <>
              <SuggestedFriends />
              <SuggestedFollowers />
              <Footer />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;