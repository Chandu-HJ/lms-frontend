import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

interface NavbarProps {
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

const Navbar = ({ role }: NavbarProps) => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Dynamic configuration based on Role
  const config = {
    STUDENT: {
      placeholder: "Search for new courses or lessons...",
      links: [{ name: "My Learning", path: "/student/my-courses" }]
    },
    INSTRUCTOR: {
      placeholder: "Search students, assignments, analytics...",
      links: [{ name: "Instructor Home", path: "/instructor/dashboard" }]
    },
    ADMIN: {
      placeholder: "Search users, courses, reports...",
      links: [{ name: "Admin Panel", path: "/admin/dashboard" }]
    }
  };

  const currentConfig = config[role];

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        {/* Search Bar - placeholder changes by role */}
        <div className={styles.searchBar}>
          <span>🔍</span>
          <input type="text" placeholder={currentConfig.placeholder} />
        </div>
      </div>

      <div className={styles.right}>
        {/* Role-specific quick links (Optional) */}
        <div className={styles.quickLinks}>
          {currentConfig.links.map(link => (
            <span key={link.name} onClick={() => navigate(link.path)} className={styles.link}>
              {link.name}
            </span>
          ))}
        </div>

        {/* Global Notifications */}
        <div className={styles.iconButton}>
          🔔 <span className={styles.badge}>5</span>
        </div>

        {/* Profile Dropdown */}
        <div className={styles.profileWrapper}>
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${role}`} 
            alt="User" 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
          />
          {showProfileMenu && (
            <div className={styles.dropdown}>
              <div className={styles.userRoleTag}>{role}</div>
              <hr />
              <div onClick={() => navigate('/profile')}>Profile</div>
              <div className={styles.logout} onClick={() => navigate('/login')}>Logout</div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
