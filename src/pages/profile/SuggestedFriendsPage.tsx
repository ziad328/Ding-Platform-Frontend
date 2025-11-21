import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SuggestedFriendsSkeleton } from '../../components/profile/ProfileSkeletons';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';

const firstNames = ['Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Logan', 'Mia', 'Lucas'];
const lastNames = ['Anderson', 'Baker', 'Chen', 'Diaz', 'Edwards', 'Fisher', 'Garcia', 'Harris', 'Ivanov', 'Johnson', 'Khan', 'Lewis'];
const roles = ['Product Designer', 'Software Engineer', 'Marketing Lead', 'Data Scientist', 'Project Manager', 'UX Researcher', 'DevOps Engineer', 'Content Strategist'];
const locations = ['New York, USA', 'London, UK', 'Berlin, Germany', 'Paris, France', 'Cairo, Egypt', 'Dubai, UAE', 'Toronto, Canada', 'Sydney, Australia'];
const companies = ['Nova Labs', 'Orbit Health', 'PixelForge', 'Skyline Ventures', 'Northwind Tech', 'Lumos Studio', 'BluePeak Data', 'Cascade Systems'];
const educations = ['Stanford University', 'MIT', 'University of Toronto', 'Sorbonne University', 'UCLA', 'Imperial College London', 'ETH Zurich', 'University of Sydney'];
const bios = [
  'Building delightful user experiences with a focus on accessibility and inclusive design.',
  'Scaling cloud-native platforms and mentoring teams on DevOps best practices.',
  'Helping product squads validate ideas quickly using data-driven experiments.',
  'Obsessed with solving customer problems through storytelling and community.',
  'Bridging design and engineering to deliver polished, production-ready interfaces.',
  'Making AI systems explainable and ethical for everyday businesses.',
];
const focusAreas = [
  'SaaS · Growth · Design Systems',
  'Developer Experience · DevOps · Cloud',
  'Product Analytics · Experimentation',
  'Community · Content · Partnerships',
  'Frontend Architecture · Design Tokens',
  'AI/ML · Responsible Tech · Research',
];

type SuggestedFriend = Omit<ProfilePreviewFriend, 'id'> & {
  id: number;
  mutualConnections: number;
  availability: string;
  bio: string;
  focus: string;
  education: string;
};

const SuggestedFriendsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewTarget, setPreviewTarget] = useState<{ friend: SuggestedFriend; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const suggestedFriends: SuggestedFriend[] = useMemo(
    () =>
      Array.from({ length: 120 }, (_, index) => ({
        id: index + 1,
        name: `${firstNames[index % firstNames.length]} ${lastNames[(index * 3) % lastNames.length]}`,
        role: roles[index % roles.length],
        mutualConnections: (index * 7) % 58 + 3,
        location: locations[index % locations.length],
        availability: index % 2 === 0 ? 'Open to mentoring' : 'Exploring new roles',
        bio: bios[index % bios.length],
        focus: focusAreas[index % focusAreas.length],
        company: companies[index % companies.length],
        education: educations[index % educations.length],
        avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
      })) as SuggestedFriend[],
    []
  );

  const handleNavigateToProfile = (friendId: number) => {
    navigate(`/profile?user=${friendId}`);
  };

  const clearPreviewTimeout = () => {
    if (previewTimeoutRef.current) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  };

  const schedulePreviewClose = () => {
    clearPreviewTimeout();
    previewTimeoutRef.current = window.setTimeout(() => {
      setIsPreviewVisible(false);
      setPreviewTarget(null);
    }, 120);
  };

  const handlePreviewEnter = (friend: SuggestedFriend, target: HTMLDivElement) => {
    if (window.innerWidth < 768) return;
    clearPreviewTimeout();
    const rect = target.getBoundingClientRect();
    setPreviewTarget({ friend, rect });
    setIsPreviewVisible(true);
  };

  const handlePreviewLeave = () => {
    schedulePreviewClose();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      clearPreviewTimeout();
      setPreviewTarget(null);
      setIsPreviewVisible(false);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-5 w-32 rounded bg-neutral-w-300 animate-pulse" />
            <div className="h-5 w-32 rounded bg-neutral-w-300 animate-pulse" />
            <div className="space-y-2 animate-pulse pt-2">
              <div className="h-3 w-32 rounded bg-neutral-w-300" />
              <div className="h-7 w-48 rounded bg-neutral-w-300" />
              <div className="h-4 w-64 rounded bg-neutral-w-300" />
            </div>
            <SuggestedFriendsSkeleton />
          </div>
        ) : (
          <>
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              <button
                onClick={() => navigate('/profile')}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to profile
              </button>
              <h1 className="text-xl sm:text-2xl font-semibold text-neutral-b-900">
                Suggested Friends
              </h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                Connect with professionals aligned with your interests, industry, and goals.
                Browse the curated list below and grow your network.
              </p>
            </div>
            <div className="max-h-[65vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200">
              {suggestedFriends.map((friend) => (
                <div key={friend.id} className="pt-3 first:pt-0">
                  <div
                    className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between group"
                    onMouseEnter={(event) => handlePreviewEnter(friend, event.currentTarget)}
                    onMouseLeave={handlePreviewLeave}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigateToProfile(friend.id)}
                      className="flex items-start gap-3 sm:gap-4 text-left w-full sm:w-auto focus:outline-none"
                      aria-label={`Open ${friend.name}'s profile`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                        <img
                          src={friend.avatar}
                          alt={friend.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-neutral-b-900 hover:text-primary-600 transition-colors">
                          {friend.name}
                        </p>
                        <p className="text-xs sm:text-sm text-neutral-b-500">{friend.role}</p>
                        <p className="text-xs text-neutral-b-400 mt-1">
                          {friend.location} · {friend.mutualConnections} mutual connections
                        </p>
                        <p className="text-xs text-primary-600 mt-1">{friend.availability}</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Add Friend
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
      </div>
      <ProfileHoverPreview
        friend={previewTarget?.friend ?? null}
        anchorRect={previewTarget?.rect ?? null}
        visible={isPreviewVisible && !!previewTarget}
        onMouseEnter={clearPreviewTimeout}
        onMouseLeave={handlePreviewLeave}
      />
    </div>
  );
};

export default SuggestedFriendsPage;

