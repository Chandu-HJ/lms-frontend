import { NavLink, useNavigate } from 'react-router-dom';
import { clearSessionUser } from '../../../utils/authSession';
import NotificationBell from '../../notifications/NotificationBell';
import './StudentNavbar.css';

interface StudentNavbarProps {
  userName: string;
  avatarUrl: string;
}

const StudentNavbar = ({ userName, avatarUrl }: StudentNavbarProps) => {
  const navigate = useNavigate();
  const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName || 'Student')}`;

  const handleLogout = () => {
    clearSessionUser();
    sessionStorage.removeItem('student_profile_cache');
    navigate('/login', { replace: true });
  };

  return (
    <header className="studentHeaderWrap">
      <div className="studentHeaderTop">
        <h1 className="studentTitle">LMS Student Dashboard</h1>
        <div className="studentTopActions">
          <NotificationBell role="STUDENT" />
          <button type="button" className="studentProfileBtn" onClick={() => navigate('/student/profile/edit')}>
            <img src={avatarUrl || defaultAvatar} alt={userName} className="studentAvatar" />
            <span className="studentName">{userName}</span>
          </button>
          <button type="button" className="studentLogoutBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <nav className="studentNavlinks">
        <NavLink
          to="/student/dashboard"
          className={({ isActive }) => (isActive ? 'studentLink studentActive' : 'studentLink')}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/student/courses"
          className={({ isActive }) => (isActive ? 'studentLink studentActive' : 'studentLink')}
        >
          Courses
        </NavLink>
        <NavLink
          to="/student/enrolled-courses"
          className={({ isActive }) => (isActive ? 'studentLink studentActive' : 'studentLink')}
        >
          Enrolled Courses
        </NavLink>
      </nav>
    </header>
  );
};

export default StudentNavbar;
