import { useEffect, useState } from 'react';
import { studentCourseApi } from '../../api/student-course.api';
import { parseApiError } from '../../context/AuthContext';
import type { EnrolledCourseSummary } from '../../types/student.types';
import { EnrolledCourseCard } from '../../components/student/EnrolledCourseCard';

export const StudentEnrolledCoursesPage = () => {
  const [courses, setCourses] = useState<EnrolledCourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async (): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        const enrolled = await studentCourseApi.getEnrolledCourses();
        setCourses(enrolled);
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Enrolled Courses</h2>
        <p className="text-sm text-slate-500">Track your enrolled courses and progress.</p>
      </div>

      {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading enrolled courses...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <EnrolledCourseCard key={course.courseId} course={course} />
        ))}
      </div>

      {!loading && courses.length === 0 ? (
        <p className="rounded-lg bg-white px-3 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          You have not enrolled in any courses yet.
        </p>
      ) : null}
    </section>
  );
};
