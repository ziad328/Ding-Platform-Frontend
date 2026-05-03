import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/marketplace/seller',          label: 'Dashboard' },
  { to: '/marketplace/seller/profile',  label: 'Profile' },
  { to: '/marketplace/seller/products', label: 'Products' },
  { to: '/marketplace/seller/deals',    label: 'Deals' },
];

function SellerDashboardNav() {
  return (
    <nav className="flex gap-1 p-1 rounded-xl bg-neutral-b-100 dark:bg-neutral-b-800 mb-6 flex-wrap">
      {NAV_ITEMS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/marketplace/seller'}
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

export default SellerDashboardNav;
