import { NavLink, useNavigate } from 'react-router-dom';
import { clearSessionUser } from '../../../utils/authSession';
import styles from './InstructorNavbar.module.css';
import NotificationBell from '../../notifications/NotificationBell';

interface InstructorNavbarProps {
  userName: string;
  avatarUrl: string;
}

const InstructorNavbar = ({ userName, avatarUrl }: InstructorNavbarProps) => {
  const navigate = useNavigate();
  const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName || 'Instructor')}`;

  const handleLogout = () => {
    clearSessionUser();
    navigate('/login', { replace: true });
  };

  return (
    <header className={styles.headerWrap}>
      <div className={styles.headerTop}>
        <h1 className={styles.title}>LMS Instructor Dashboard</h1>
        <div className={styles.topActions}>
          <NotificationBell role="INSTRUCTOR" />
          <div className={styles.profile}>
            <img src={avatarUrl || defaultAvatar} alt={userName} className={styles.avatar} />
            <span className={styles.name}>{userName}</span>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <nav className={styles.navlinks}>
        <NavLink
          to="/instructor/dashboard"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/instructor/courses"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          My Courses
        </NavLink>
        <NavLink
          to="/instructor/create"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          Create Course
        </NavLink>
        <NavLink
          to="/instructor/business-stats"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          Business Stats
        </NavLink>
      </nav>
    </header>
  );
};

export default InstructorNavbar;
