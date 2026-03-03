import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { type UserRole } from '../interfaces/auth.types';
import { getSessionUser } from '../utils/authSession';

interface Props {
  allowedRoles: UserRole[];
  requireActive?: boolean;
}

const ROLE_HOME_PATH: Record<UserRole, string> = {
  STUDENT: '/student/dashboard',
  INSTRUCTOR: '/instructor/dashboard',
  ADMIN: '/admin/users',
};

const ProtectedRoute = ({ allowedRoles, requireActive = true }: Props) => {
  const location = useLocation();
  const user = getSessionUser();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireActive && user.status !== 'ACTIVE') {
    return <Navigate to="/account/pending" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME_PATH[user.role]} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
