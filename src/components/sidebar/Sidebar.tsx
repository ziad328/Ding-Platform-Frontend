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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-w-400 shadow-lg md:hidden">
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
                    className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-neutral-b-500'
                      }`}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Card */}
      <aside className="hidden md:block p-4 overflow-y-auto">
        <div className="w-64 bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="h-20 bg-neutral-w-300" />

          {/* Profile Content */}
          <div className="px-4 pb-4">
            {/* Avatar */}
            <div className="relative -mt-10 mb-3 w-16 h-16 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md">
              <User className="w-8 h-8 text-neutral-b-400" />
            </div>

            {/* User Info */}
            <h3 className="text-sm font-bold text-neutral-b-900 mb-0.5">
              {user?.name || 'Robert Fox'}
            </h3>
            <p className="text-xs text-neutral-b-500 mb-4">Software Engineer</p>

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
                        ? 'bg-primary-500 text-white shadow-sm'
                        : 'text-neutral-b-600 hover:bg-neutral-w-200'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-b-600'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-b-600'}`}>
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