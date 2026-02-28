import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getSessionUser } from '../../../utils/authSession';
import { NotificationsProvider } from '../../../context/NotificationsContext';
import PageBackButton from '../../common/PageBackButton';
import StudentNavbar from './StudentNavbar';
import './StudentLayout.css';

const StudentLayout = () => {
  const [sessionUser, setSessionUser] = useState(getSessionUser());
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const showBackButton = pathSegments.length > 2;

  useEffect(() => {
    const refreshSessionUser = () => setSessionUser(getSessionUser());
    const poller = window.setInterval(refreshSessionUser, 5000);
    window.addEventListener('storage', refreshSessionUser);
    document.addEventListener('visibilitychange', refreshSessionUser);
    window.addEventListener('focus', refreshSessionUser);

    return () => {
      window.clearInterval(poller);
      window.removeEventListener('storage', refreshSessionUser);
      document.removeEventListener('visibilitychange', refreshSessionUser);
      window.removeEventListener('focus', refreshSessionUser);
    };
  }, []);

  if (!sessionUser || sessionUser.role !== 'STUDENT') {
    return <Navigate to="/login" replace />;
  }

  if (sessionUser.status !== 'ACTIVE') {
    return <Navigate to="/account/pending" replace />;
  }

  return (
    <NotificationsProvider>
      <div className="studentPage">
        <StudentNavbar userName={sessionUser.userName} avatarUrl={sessionUser.avatarUrl} />
        <main className="studentContent">
          {showBackButton && (
            <div className="layoutBackRow">
              <PageBackButton fallbackPath="/student/dashboard" />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </NotificationsProvider>
  );
};

export default StudentLayout;
