import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth/auth';

/**
 * AdminGuard — wraps routes that require ADMIN role.
 * Redirects non-admins to /marketplace silently.
 */
function AdminGuard() {
  const _user = useSelector(selectCurrentUser);

  if (!_user || _user.role !== 'ADMIN') {
    return <Navigate to="/marketplace" replace />;
  }

  return <Outlet />;
}

export default AdminGuard;
