import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface SidebarProps {
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

const Sidebar = ({ role }: SidebarProps) => {
  // Menu items based on the features in your PDF [cite: 12, 14, 77]
  const instructorLinks = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: '📊' },
    { name: 'My Courses', path: '/instructor/courses', icon: '📚' },
    { name: 'Create Course', path: '/instructor/create', icon: '➕' },
    { name: 'Assignments', path: '/instructor/assignments', icon: '📝' },
    { name: 'Discussions', path: '/instructor/discussions', icon: '💬' },
    { name: 'Analytics', path: '/instructor/analytics', icon: '📈' },
    { name: 'Notifications', icon: '🔔', path: '/instructor/notifications' },
  ];

  // We can add studentLinks or adminLinks here later [cite: 5, 11]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <h2 className={styles.logo}>LMS Pro</h2>
      </div>

      <nav className={styles.nav}>
        {role === 'INSTRUCTOR' && instructorLinks.map((link) => (
          <NavLink 
            key={link.path} 
            to={link.path} 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <span className={styles.icon}>{link.icon}</span>
            <span className={styles.linkName}>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn}>
          <span className={styles.icon}>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
