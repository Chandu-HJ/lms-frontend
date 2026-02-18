import { useEffect, useState } from 'react';
import { parseApiError } from '../../context/AuthContext';
import { studentCourseApi } from '../../api/student-course.api';
import type { Course } from '../../types/course.types';
import type { EnrolledCourseSummary } from '../../types/student.types';
import { HorizontalCarousel } from '../../components/student/HorizontalCarousel';
import { StudentCourseCard } from '../../components/student/StudentCourseCard';
import { EnrolledCourseCard } from '../../components/student/EnrolledCourseCard';

export const StudentDashboardPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseSummary[]>([]);
  const [freeCourses, setFreeCourses] = useState<Course[]>([]);
  const [paidCourses, setPaidCourses] = useState<Course[]>([]);
  const [interestedCourses, setInterestedCourses] = useState<Course[]>([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async (): Promise<void> => {
      setLoading(true);
      setError('');

      try {
        const [enrolled, free, paid, interested] = await Promise.all([
          studentCourseApi.getEnrolledCourses(),
          studentCourseApi.getCoursesByType('FREE').catch(() => []),
          studentCourseApi.getCoursesByType('PAID').catch(() => []),
          studentCourseApi.getInterestedCategoryCourses().catch(() => []),
        ]);

        setEnrolledCourses(enrolled);
        setFreeCourses(free);
        setPaidCourses(paid);
        setInterestedCourses(interested);
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const enrolledCourseIds = enrolledCourses.map((item) => item.courseId);
  const visibleInterestedCourses = interestedCourses.filter((course) => !enrolledCourseIds.includes(course.id));
  const visibleFreeCourses = freeCourses.filter((course) => !enrolledCourseIds.includes(course.id));
  const visiblePaidCourses = paidCourses.filter((course) => !enrolledCourseIds.includes(course.id));

  const handleEnroll = async (courseId: number): Promise<void> => {
    setEnrollingCourseId(courseId);
    setMessage('');
    setError('');
    try {
      await studentCourseApi.enrollCourse(courseId);
      const refreshed = await studentCourseApi.getEnrolledCourses();
      setEnrolledCourses(refreshed);
      setMessage('Course enrolled successfully.');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
        <p className="text-sm text-slate-500">Continue learning and discover your next course.</p>
      </div>

      {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {loading ? <p className="rounded-lg bg-white px-3 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">Loading dashboard...</p> : null}

      {!loading ? (
        <>
          <HorizontalCarousel
            title="My Enrolled Courses"
            viewAllTo="/student/enrolled-courses"
            hasItems={enrolledCourses.length > 0}
            emptyMessage="You have not enrolled in any courses yet."
          >
            {enrolledCourses.map((course) => (
              <div key={course.courseId} className="w-[260px] flex-none">
                <EnrolledCourseCard course={course} />
              </div>
            ))}
          </HorizontalCarousel>

          <HorizontalCarousel
            title="Courses Based On Your Interests"
            viewAllTo="/student/courses"
            hasItems={visibleInterestedCourses.length > 0}
            emptyMessage="No additional interest-based courses. Enrolled ones are shown only above."
          >
            {visibleInterestedCourses.map((course) => (
              <div key={course.id} className="w-[260px] flex-none">
                <StudentCourseCard
                  course={course}
                  canEnroll={!enrolledCourseIds.includes(course.id)}
                  isEnrolling={enrollingCourseId === course.id}
                  onEnroll={(id) => void handleEnroll(id)}
                />
              </div>
            ))}
          </HorizontalCarousel>

          <HorizontalCarousel
            title="Free Courses"
            viewAllTo="/student/courses"
            hasItems={visibleFreeCourses.length > 0}
            emptyMessage="No additional free courses. Enrolled ones are shown only above."
          >
            {visibleFreeCourses.map((course) => (
              <div key={course.id} className="w-[260px] flex-none">
                <StudentCourseCard
                  course={course}
                  canEnroll={!enrolledCourseIds.includes(course.id)}
                  isEnrolling={enrollingCourseId === course.id}
                  onEnroll={(id) => void handleEnroll(id)}
                />
              </div>
            ))}
          </HorizontalCarousel>

          <HorizontalCarousel
            title="Paid Courses"
            viewAllTo="/student/courses"
            hasItems={visiblePaidCourses.length > 0}
            emptyMessage="No additional paid courses. Enrolled ones are shown only above."
          >
            {visiblePaidCourses.map((course) => (
              <div key={course.id} className="w-[260px] flex-none">
                <StudentCourseCard
                  course={course}
                  canEnroll={!enrolledCourseIds.includes(course.id)}
                  isEnrolling={enrollingCourseId === course.id}
                  onEnroll={(id) => void handleEnroll(id)}
                />
              </div>
            ))}
          </HorizontalCarousel>
        </>
      ) : null}
    </section>
  );
};
