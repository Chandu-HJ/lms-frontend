import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCourseProgressReport } from '../../api/course.service';
import { type CourseProgressReportItem } from '../../interfaces/course.types';
import styles from './CourseProgressReport.module.css';

const CourseProgressReport = () => {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = Number(params.courseId);

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<CourseProgressReportItem[]>([]);
  const [message, setMessage] = useState('');

  const formatDecimal = (value: number) => {
    const formatted = value.toFixed(2);
    return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
  };

  const fetchReport = async () => {
    if (!courseId) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await getCourseProgressReport(courseId);
      const data = response.data ?? [];
      setStudents(data);
      if (!data.length) {
        setMessage('No enrolled students yet for this course.');
      }
    } catch (error) {
      console.error('Unable to fetch progress report', error);
      setStudents([]);
      setMessage('Unable to load enrolled students progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [courseId]);

  if (!courseId || Number.isNaN(courseId)) {
    return <div className={styles.message}>Invalid course id.</div>;
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <h2>Enrolled Students & Progress</h2>
        <div className={styles.actions}>
          <button type="button" className={styles.refreshBtn} onClick={fetchReport} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button type="button" className={styles.backBtn} onClick={() => navigate(`/instructor/courses/${courseId}/modules`)}>
            Back to Modules
          </button>
        </div>
      </div>

      <p className={styles.subtitle}>Course ID: {courseId}</p>

      <div className={styles.headerRow}>
        <p>Student</p>
        <p>Course Completed</p>
        <p>Progress</p>
        <p>Quiz Best Score</p>
      </div>

      {loading && <div className={styles.message}>Loading enrolled students progress...</div>}
      {!loading && message && <div className={styles.message}>{message}</div>}
      {!loading && students.length > 0 && (
        <div className={styles.list}>
          {students.map((student) => (
            <article key={student.studentId} className={styles.row}>
              <div className={styles.studentCell}>
                <p className={styles.studentName}>
                  {student.firstName} {student.lastName}
                </p>
                <p className={styles.studentEmail}>{student.email}</p>
              </div>
              <p className={styles.metric}>{student.itemsCompleted >= student.totalItems ? 'Yes' : 'No'}</p>
              <p className={styles.metric}>{formatDecimal(student.completionPercentage)}%</p>
              <p className={styles.metric}>{formatDecimal(student.bestScore)}%</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default CourseProgressReport;
