import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from './Dashboard.module.css';

const DashboardLayout = () => {
  // You would typically get the role from your Auth state 
  const userRole = 'INSTRUCTOR'; 

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar stays fixed on the left */}
      <Sidebar role={userRole} />

      <div className={styles.mainWrapper}>
        {/* Navbar stays fixed at the top */}
        <Navbar role={userRole} />

        {/* This is where your Dashboard page content appears */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>  {/* ✅ fixed */}
      </div>
    </div>
  );
};

export default DashboardLayout;
