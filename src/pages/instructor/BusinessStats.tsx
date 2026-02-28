import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructorCourseRevenueStats } from '../../api/course.service';
import { type InstructorCourseRevenueStat } from '../../interfaces/course.types';
import { formatInr } from '../../utils/currency';
import styles from './BusinessStats.module.css';

const BusinessStats = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<InstructorCourseRevenueStat[]>([]);
  const [overallTotalRevenue, setOverallTotalRevenue] = useState(0);
  const [message, setMessage] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await getInstructorCourseRevenueStats();
      const stats = response.data;
      setCourses(stats?.courses ?? []);
      setOverallTotalRevenue(stats?.overallTotalRevenue ?? 0);

      if (!(stats?.courses?.length ?? 0)) {
        setMessage('No course revenue stats available yet.');
      }
    } catch (error) {
      console.error('Unable to fetch instructor business stats', error);
      setCourses([]);
      setOverallTotalRevenue(0);
      setMessage('Unable to load business stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <div>
          <h2>Business Stats</h2>
          <p className={styles.subtitle}>Course-wise enrollments and revenue</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={fetchStats} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className={styles.totalCard}>
        <p className={styles.totalLabel}>Overall Total Revenue</p>
        <p className={styles.totalValue}>{formatInr(overallTotalRevenue)}</p>
      </div>

      <div className={styles.headerRow}>
        <p>Course</p>
        <p>Price</p>
        <p>Total Enrollments</p>
        <p>Total Revenue</p>
        <p>Enrolled Students</p>
      </div>

      {loading && <div className={styles.message}>Loading business stats...</div>}
      {!loading && message && <div className={styles.message}>{message}</div>}

      {!loading && courses.length > 0 && (
        <div className={styles.list}>
          {courses.map((course) => (
            <article key={course.courseId} className={styles.row}>
              <p className={styles.courseTitle}>{course.title}</p>
              <p className={styles.metric}>{formatInr(course.price)}</p>
              <p className={styles.metric}>{course.enrollmentCount}</p>
              <p className={styles.metric}>{formatInr(course.totalRevenue)}</p>
              <button
                type="button"
                className={styles.studentsBtn}
                onClick={() => navigate(`/instructor/courses/${course.courseId}/progress-report`)}
              >
                View Enrolled Students
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default BusinessStats;
