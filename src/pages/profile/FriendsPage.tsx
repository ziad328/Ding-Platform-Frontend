import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileHoverPreview from '../../components/profile/ProfileHoverPreview';
import type { ProfilePreviewFriend } from '../../components/profile/ProfileHoverPreview';

const friendFirstNames = ['Cameron', 'Diana', 'Isaac', 'Florence', 'Marcus', 'Nour', 'Quinn', 'Selena', 'Tomas', 'Valeria', 'Wyatt', 'Yasmine'];
const friendLastNames = ['Sawyer', 'Bishop', 'Kaur', 'Lopez', 'Peterson', 'Mensah', 'Kim', 'Farrell', 'Ivers', 'Fadel', 'Young', 'Zimmer'];
const friendRoles = ['Product Manager', 'Design Lead', 'ML Engineer', 'Growth Marketer', 'Customer Success', 'Operations Lead'];
const friendCompanies = ['Driftspace', 'Helios Lab', 'Nimbus Health', 'Brightline', 'Fjord Studio', 'Atlas Loop'];
const friendLocations = ['Toronto, Canada', 'Madrid, Spain', 'Dubai, UAE', 'Austin, USA', 'Nairobi, Kenya', 'Stockholm, Sweden'];
const friendStories = [
  'Met during Ding Labs accelerator.',
  'Co-hosted a product AMA last quarter.',
  'Worked together on the Playbook launch.',
  'Introduced via the community town hall.',
];

type FriendProfile = Omit<ProfilePreviewFriend, 'id'> & {
  id: number;
  connectedOn: string;
  recentCollab: string;
};

const FriendsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewTarget, setPreviewTarget] = useState<{ friend: FriendProfile; rect: DOMRect } | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const previewTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const friends: FriendProfile[] = useMemo(
    () =>
      Array.from({ length: 48 }, (_, index) => ({
        id: index + 1,
        name: `${friendFirstNames[index % friendFirstNames.length]} ${friendLastNames[(index * 5) % friendLastNames.length]}`,
        role: friendRoles[index % friendRoles.length],
        company: friendCompanies[index % friendCompanies.length],
        location: friendLocations[index % friendLocations.length],
        avatar: `https://i.pravatar.cc/150?img=${(index % 70) + 1}`,
        connectedOn: `${(index % 10) + 1} months ago`,
        recentCollab: friendStories[index % friendStories.length],
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

  const handlePreviewEnter = (friend: FriendProfile, target: HTMLDivElement) => {
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
            <div className="h-5 w-48 rounded bg-neutral-w-300" />
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
              <h1 className="text-xl sm:text-2xl font-semibold text-neutral-b-900">Friends</h1>
              <p className="text-sm sm:text-base text-neutral-b-600">
                You’re connected with these members. Message them or revisit recent collaborations.
              </p>
            </div>
            <div className="max-h-[65vh] overflow-y-auto hide-scrollbar pr-1 sm:pr-2 space-y-3 sm:space-y-4 divide-y divide-neutral-w-200">
              {friends.map((friend) => (
                <div key={friend.id} className="pt-3 first:pt-0">
                  <div
                    className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                    onMouseEnter={(event) => handlePreviewEnter(friend, event.currentTarget)}
                    onMouseLeave={handlePreviewLeave}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0 sm:w-14 sm:h-14 overflow-hidden">
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-neutral-b-900">{friend.name}</p>
                        <p className="text-xs sm:text-sm text-neutral-b-500">{friend.role} · {friend.company}</p>
                        <p className="text-xs text-neutral-b-400 mt-1">{friend.location} · Connected {friend.connectedOn}</p>
                        <p className="text-xs text-primary-600 mt-1">{friend.recentCollab}</p>
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
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-b-700 border border-neutral-w-300 rounded-lg hover:bg-neutral-w-200 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                        Remove
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
        primaryActionLabel="Remove"
        primaryActionIcon={<UserMinus className="w-4 h-4" />}
        secondaryActionLabel="Message"
        secondaryActionIcon={<MessageCircle className="w-4 h-4" />}
      />
    </div>
  );
};

export default FriendsPage;


