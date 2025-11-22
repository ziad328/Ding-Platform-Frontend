import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, UserPlus, Briefcase, GraduationCap } from 'lucide-react';

export interface ProfilePreviewFriend {
  id: number | string;
  name: string;
  role: string;
  company: string;
  location: string;
  avatar: string;
  bio?: string;
  focus?: string;
  education?: string;
}

interface ProfileHoverPreviewProps {
  friend: ProfilePreviewFriend | null;
  anchorRect: DOMRect | null;
  visible: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  primaryActionIcon?: ReactNode;
  secondaryActionIcon?: ReactNode;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionDisabled?: boolean;
  secondaryActionDisabled?: boolean;
}

interface PlacementState {
  top: number;
  left: number;
  arrowOffset: number;
  position: 'top' | 'bottom';
}

const TOOLTIP_WIDTH = 360;
const TOOLTIP_HEIGHT = 260;
const VIEWPORT_PADDING = 12;
const GAP = 16;

const ProfileHoverPreview = ({
  friend,
  anchorRect,
  visible,
  onMouseEnter,
  onMouseLeave,
  primaryActionLabel = 'Follow',
  secondaryActionLabel = 'Message',
  primaryActionIcon = <UserPlus className="w-4 h-4" />,
  secondaryActionIcon = <MessageCircle className="w-4 h-4" />,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionDisabled = false,
  secondaryActionDisabled = false,
}: ProfileHoverPreviewProps) => {
  const [placement, setPlacement] = useState<PlacementState | null>(null);

  useEffect(() => {
    if (!visible || !anchorRect || !friend) {
      setPlacement(null);
      return;
    }

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spaceBelow = viewportHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    const position: PlacementState['position'] =
      spaceBelow < TOOLTIP_HEIGHT && spaceAbove > spaceBelow ? 'top' : 'bottom';

    let top =
      position === 'top'
        ? anchorRect.top - TOOLTIP_HEIGHT - GAP
        : anchorRect.bottom + GAP;
    top = Math.max(
      VIEWPORT_PADDING,
      Math.min(top, viewportHeight - TOOLTIP_HEIGHT - VIEWPORT_PADDING)
    );

    const centerX = anchorRect.left + anchorRect.width / 2;
    let left = centerX - TOOLTIP_WIDTH / 2;
    if (left < VIEWPORT_PADDING) {
      left = VIEWPORT_PADDING;
    } else if (left + TOOLTIP_WIDTH > viewportWidth - VIEWPORT_PADDING) {
      left = viewportWidth - TOOLTIP_WIDTH - VIEWPORT_PADDING;
    }

    const arrowOffset = Math.max(
      24,
      Math.min(TOOLTIP_WIDTH - 24, centerX - left)
    );

    setPlacement({ top, left, arrowOffset, position });
  }, [visible, anchorRect, friend]);

  if (!visible || !friend || !anchorRect || !placement) {
    return null;
  }

  return createPortal(
    <div
      className="fixed z-9999 hidden md:block"
      style={{ top: placement.top, left: placement.left, width: TOOLTIP_WIDTH }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative rounded-2xl border border-neutral-w-300 dark:border-dark-border bg-white dark:bg-dark-bg-secondary text-neutral-b-900 dark:text-dark-text-primary p-4 shadow-xl">
        <div
          className={`absolute h-4 w-4 rotate-45 bg-white dark:bg-dark-bg-secondary border-l border-t border-neutral-w-300 dark:border-dark-border ${placement.position === 'top' ? 'bottom-0 translate-y-1/2' : '-top-2'
            }`}
          style={{ left: placement.arrowOffset }}
        />
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-w-300 dark:border-dark-border">
            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div>
            <p className="text-base font-semibold">{friend.name}</p>
            <p className="text-sm text-neutral-b-600 dark:text-dark-text-secondary leading-snug">
              {friend.role}
              {friend.company ? ` · ${friend.company}` : ''}
            </p>
            {friend.location && (
              <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted mt-1">{friend.location}</p>
            )}
          </div>
        </div>
        {friend.bio && <p className="text-sm text-neutral-b-700 dark:text-dark-text-secondary mt-3">{friend.bio}</p>}
        <div className="mt-3 space-y-1 text-xs text-neutral-b-600 dark:text-dark-text-secondary">
          {friend.company && (
            <p className="flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              Works at {friend.company}
            </p>
          )}
          {friend.education && (
            <p className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-primary-500 dark:text-primary-400" />
              Studied at {friend.education}
            </p>
          )}
          {friend.focus && <p className="text-neutral-b-500 dark:text-dark-text-muted">Focus: {friend.focus}</p>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSecondaryAction}
            disabled={secondaryActionDisabled}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1 rounded-xl border border-neutral-w-300 dark:border-dark-border px-3 py-1.5 text-sm font-medium text-neutral-b-800 dark:text-dark-text-primary hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary transition-colors"
          >
            {secondaryActionIcon}
            {secondaryActionLabel}
          </button>
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={primaryActionDisabled}
            className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1 rounded-xl bg-primary-600 dark:bg-primary-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors"
          >
            {primaryActionIcon}
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileHoverPreview;


