import { NavLink } from 'react-router-dom';
import styles from './InstructorSidebar.module.css';

const InstructorSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/instructor/dashboard', icon: '📊' },
    { name: 'My Courses', path: '/instructor/courses', icon: '📚' },
    { name: 'Create Course', path: '/instructor/create', icon: '➕' },
    { name: 'Assignments', path: '/instructor/assignments', icon: '📝' },
    { name: 'Discussions', path: '/instructor/discussions', icon: '💬' },
    { name: 'Analytics', path: '/instructor/analytics', icon: '📈' },
    { name: 'Certificates', path: '/instructor/certificates', icon: '🎓' },
    { name: 'Notifications', path: '/instructor/notifications', icon: '🔔' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>LMS INSTRUCTOR</div>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => isActive ? `${styles.item} ${styles.active}` : styles.item}
          >
            <span>{item.icon}</span> {item.name}
          </NavLink>
        ))}
      </nav>
      <div className={styles.footer}>
        <button className={styles.logoutBtn}>🚪 Logout</button>
      </div>
    </aside>
  );
};

export default InstructorSidebar;