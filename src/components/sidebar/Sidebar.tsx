import { Home, User, MessageSquare, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';

function Sidebar() {
  const user = useSelector(selectCurrentUser);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-bg-secondary border-t border-neutral-w-400 dark:border-dark-border shadow-lg md:hidden">
        <div className="flex items-center justify-around h-12 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center justify-center w-full h-full touch-manipulation"
              >
                {({ isActive }) => (
                  <Icon
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-b-500 dark:text-dark-text-muted'
                      }`}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Card */}
      <aside className="hidden md:block p-4 py-12 overflow-y-auto">
        <div className="w-64 bg-white dark:bg-dark-bg-secondary rounded-xl shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="h-20 bg-neutral-w-300 dark:bg-dark-bg-tertiary" />

          {/* Profile Content */}
          <div className="px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-10 mb-3 w-16 h-16 rounded-full bg-white dark:bg-dark-bg-secondary flex items-center justify-center border-4 border-white dark:border-dark-bg-secondary shadow-md">
              <User className="w-8 h-8 text-neutral-b-400 dark:text-dark-text-muted" />
            </div>

            {/* User Info */}
            <h3 className="text-sm font-bold text-neutral-b-900 dark:text-dark-text-primary ml-3 mb-0.5">
              {user?.name || 'Robert Fox'}
            </h3>
            <p className="text-xs text-neutral-b-500 dark:text-dark-text-muted ml-3 mb-4">Software Engineer</p>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${isActive
                        ? 'bg-primary-500 dark:bg-primary-700 text-white shadow-sm'
                        : 'text-neutral-b-600 dark:text-dark-text-secondary hover:bg-neutral-w-200 dark:hover:bg-dark-bg-tertiary'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-b-600 dark:text-dark-text-secondary'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-b-600 dark:text-dark-text-secondary'}`}>
                          {item.label}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;