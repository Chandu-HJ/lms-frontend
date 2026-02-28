import { NavLink, useNavigate } from 'react-router-dom';
import { clearSessionUser } from '../../../utils/authSession';
import NotificationBell from '../../notifications/NotificationBell';
import './AdminNavbar.css';

interface AdminNavbarProps {
  userName: string;
  avatarUrl: string;
}

const AdminNavbar = ({ userName, avatarUrl }: AdminNavbarProps) => {
  const navigate = useNavigate();
  const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName || 'Admin')}`;

  return (
    <header className="adminHeaderWrap">
      <div className="adminHeaderTop">
        <h1 className="adminTitle">LMS Admin Dashboard</h1>
        <div className="adminTopActions">
          <NotificationBell role="ADMIN" />
          <div className="adminProfile">
            <img src={avatarUrl || defaultAvatar} alt={userName} className="adminAvatar" />
            <span>{userName}</span>
          </div>
          <button
            type="button"
            className="adminLogoutBtn"
            onClick={() => {
              clearSessionUser();
              navigate('/login', { replace: true });
            }}
          >
            Logout
          </button>
        </div>
      </div>
      <nav className="adminNavLinks">
        <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'adminLink adminActive' : 'adminLink')}>
          Users
        </NavLink>
        <NavLink to="/admin/pending-users" className={({ isActive }) => (isActive ? 'adminLink adminActive' : 'adminLink')}>
          Pending Users
        </NavLink>
        <NavLink to="/admin/courses" className={({ isActive }) => (isActive ? 'adminLink adminActive' : 'adminLink')}>
          Courses
        </NavLink>
        <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'adminLink adminActive' : 'adminLink')}>
          Add Category
        </NavLink>
      </nav>
    </header>
  );
};

export default AdminNavbar;
