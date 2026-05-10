import { NavLink } from 'react-router-dom';

const ADMIN_NAV_ITEMS = [
  { to: '/marketplace/admin/applications', label: 'Applications' },
  { to: '/marketplace/admin/sellers',      label: 'Sellers' },
  { to: '/marketplace/admin/logs',         label: 'Audit Logs' },
];

function AdminMarketplaceNav() {
  return (
    <nav className="flex gap-1 p-1 rounded-xl bg-neutral-b-100 dark:bg-neutral-b-800 mb-6 flex-wrap">
      {ADMIN_NAV_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors
             ${
               isActive
                 ? 'bg-white dark:bg-neutral-b-700 text-neutral-b-900 dark:text-dark-text-primary shadow-sm'
                 : 'text-neutral-b-600 dark:text-dark-text-muted hover:text-neutral-b-800 dark:hover:text-dark-text-secondary'
             }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AdminMarketplaceNav;
