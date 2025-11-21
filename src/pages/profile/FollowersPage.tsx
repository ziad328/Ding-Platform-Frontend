import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';

const followerFirstNames = ['Aria', 'Miles', 'Priya', 'Jude', 'Helena', 'Rafael', 'Nadia', 'Andre', 'Tara', 'Xavier', 'Ines', 'Zane'];
const followerLastNames = ['Lopez', 'Singh', 'Petrov', 'Okoro', 'Ahmed', 'Costa', 'Yamamoto', 'Ibrahim', 'McCarthy', 'Sato', 'Dubois', 'Keller'];
const followerRoles = ['Product Engineer', 'CX Strategist', 'Marketing Lead', 'Solutions Architect', 'Design Manager', 'Community Lead'];
const followerCompanies = ['Northwind Labs', 'Helio Systems', 'Vector Health', 'Kinetic Studio', 'Nimbus AI', 'Lunar Capital'];
const followerLocations = ['Chicago, USA', 'Berlin, Germany', 'Mumbai, India', 'Dubai, UAE', 'Vancouver, Canada', 'Oslo, Norway'];
const followerHighlights = [
  'Following you since joining Ding.',
  'Engages with your product posts frequently.',
  'Attended your recent virtual AMA.',
  'Shares similar interests in AI Ops.',
];

type FollowerProfile = Omit<ProfilePreviewFriend, 'id'> & {
  id: number;
  joined: string;
  engagement: string;
};

const FollowersPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewTarget, setPreviewTarget] = useState<{ follower: FollowerProfile; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const followers: FollowerProfile[] = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        id: index + 1,
        name: `${followerFirstNames[index % followerFirstNames.length]} ${followerLastNames[(index * 3) % followerLastNames.length]}`,
        role: followerRoles[index % followerRoles.length],
        company: followerCompanies[index % followerCompanies.length],
        location: followerLocations[index % followerLocations.length],
        avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
        joined: `${(index % 11) + 1} months ago`,
        engagement: followerHighlights[index % followerHighlights.length],
      })),
    []
  );

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

  const handlePreviewEnter = (follower: FollowerProfile, target: HTMLDivElement) => {
    if (window.innerWidth < 768) return;
    clearPreviewTimeout();
    const rect = target.getBoundingClientRect();
    setPreviewTarget({ follower, rect });
    setIsPreviewVisible(true);
  };

  const handlePreviewLeave = () => {
    schedulePreviewClose();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const timer = setTimeout(() => setIsLoading(false), 1000);
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
          <div className="space-y-3 animate-pulse">
            <div className="h-5 w-44 rounded bg-neutral-w-300" />
            <div className="h-5 w-36 rounded bg-neutral-w-300" />
            <div className="h-32 rounded-lg bg-neutral-w-300" />
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
              <h1 className="text-xl sm:text-2xl font-semibold text-neutral-b-900">Followers</h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                These members follow your updates. Send a quick note or start a conversation.
              </p>
            </div>
            <div className="max-h-[65vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200">
              {followers.map((follower) => (
                <div key={follower.id} className="pt-3 first:pt-0">
                  <div
                    className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    onMouseEnter={(event) => handlePreviewEnter(follower, event.currentTarget)}
                    onMouseLeave={handlePreviewLeave}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                        <img src={follower.avatar} alt={follower.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-neutral-b-900">{follower.name}</p>
                        <p className="text-xs sm:text-sm text-neutral-b-500">{follower.role} · {follower.company}</p>
                        <p className="text-xs text-neutral-b-400 mt-1">{follower.location} · Joined {follower.joined}</p>
                        <p className="text-xs text-primary-600 mt-1">{follower.engagement}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary-600 border border-primary-100 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
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
        friend={previewTarget?.follower ?? null}
        anchorRect={previewTarget?.rect ?? null}
        visible={isPreviewVisible && !!previewTarget}
        onMouseEnter={clearPreviewTimeout}
        onMouseLeave={handlePreviewLeave}
        primaryActionLabel="Follow back"
        primaryActionIcon={<UserPlus className="w-4 h-4" />}
        secondaryActionLabel="Message"
        secondaryActionIcon={<MessageCircle className="w-4 h-4" />}
      />
    </div>
  );
};

export default FollowersPage;


