import { useEffect, useState } from 'react';
import { getAdminCourses } from '../../api/admin.service';
import { type AdminCourse } from '../../interfaces/admin.types';
import { formatInr } from '../../utils/currency';
import './AdminCourses.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await getAdminCourses();
        setCourses(data);
      } catch (error) {
        console.error('Unable to fetch admin courses', error);
      } finally {
        setLoading(false);
      }
    };
    void loadCourses();
  }, []);

  return (
    <section className="adminCard">
      <h2>All Courses</h2>
      {loading ? <p className="adminMuted">Loading courses...</p> : null}
      {!loading && courses.length === 0 ? <p className="adminMuted">No courses found.</p> : null}
      {!loading && courses.length > 0 ? (
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.instructorName ?? 'N/A'}</td>
                  <td>{course.status}</td>
                  <td>{course.price == null ? 'N/A' : formatInr(course.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default AdminCourses;
