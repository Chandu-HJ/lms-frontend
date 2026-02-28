import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSessionUser } from '../../../utils/authSession';
import { NotificationsProvider } from '../../../context/NotificationsContext';
import PageBackButton from '../../common/PageBackButton';
import AdminNavbar from './AdminNavbar';
import './AdminLayout.css';

const AdminLayout = () => {
  const sessionUser = getSessionUser();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const showBackButton = pathSegments.length > 2;

  if (!sessionUser || sessionUser.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <NotificationsProvider>
      <div className="adminPage">
        <AdminNavbar userName={sessionUser.userName} avatarUrl={sessionUser.avatarUrl} />
        <main className="adminContent">
          {showBackButton && (
            <div className="layoutBackRow">
              <PageBackButton fallbackPath="/admin/users" />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </NotificationsProvider>
  );
};

export default AdminLayout;
