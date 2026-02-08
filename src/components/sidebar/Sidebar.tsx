import {
  RiHome9Line,
  RiHome9Fill,
  RiSendInsLine,
  RiSendInsFill,
  RiVideoLine,
  RiVideoFill,
  RiStoreLine,
  RiStoreFill,
  RiUserLine,
  RiUserFill,
  RiSettings2Line,
  RiSettings2Fill,
} from '@remixicon/react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { iconOutline: RiHome9Line, iconFill: RiHome9Fill, label: 'Home', path: '/' },
    { iconOutline: RiSendInsLine, iconFill: RiSendInsFill, label: 'Messages', path: '/messages' },
    { iconOutline: RiVideoLine, iconFill: RiVideoFill, label: 'Reels', path: '/reels' },
    { iconOutline: RiStoreLine, iconFill: RiStoreFill, label: 'Market', path: '/marketplace' },
    { iconOutline: RiUserLine, iconFill: RiUserFill, label: 'Profile', path: '/profile' },
    { iconOutline: RiSettings2Line, iconFill: RiSettings2Fill, label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-bg-secondary/80 backdrop-blur-md border-t border-neutral-w-400 dark:border-dark-border md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-12 sm:h-14 px-2">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex items-center justify-center flex-1 h-full touch-manipulation active:scale-95 transition-transform"
            >
              {({ isActive }) => {
                const Icon = isActive ? item.iconFill : item.iconOutline;
                return (
                  <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all hover:bg-neutral-b-200/40 dark:hover:bg-dark-bg-tertiary/60 active:bg-neutral-w-300 dark:active:bg-dark-bg-tertiary">
                    <Icon
                      size={22}
                      className={`transition-colors ${isActive
                        ? 'text-neutral-b-800 dark:text-neutral-w-200'
                        : 'text-neutral-b-500 dark:text-dark-text-muted'
                        }`}
                    />
                  </div>
                );
              }}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col items-center py-4 mx-0.5 w-20 shrink-0">
        <nav className="flex flex-col items-center gap-3 w-full px-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="w-full"
            >
              {({ isActive }) => {
                const Icon = isActive ? item.iconFill : item.iconOutline;
                return (
                  <div
                    className="flex flex-col items-center justify-center py-3.5 px-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-neutral-b-200/40 dark:hover:bg-dark-bg-tertiary/60"
                  >
                    <Icon
                      size={26}
                      className={`transition-colors ${isActive
                        ? 'text-neutral-b-800 dark:text-neutral-w-200'
                        : 'text-neutral-b-600 dark:text-dark-text-secondary'
                        }`}
                    />
                    <span
                      className={`text-[11px] mt-1 text-center leading-tight truncate w-full ${isActive
                        ? 'font-bold text-neutral-b-800 dark:text-neutral-w-200'
                        : 'font-medium text-neutral-b-600 dark:text-dark-text-secondary'
                        }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              }}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;