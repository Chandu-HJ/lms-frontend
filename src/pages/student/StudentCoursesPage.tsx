import { useEffect, useMemo, useState } from 'react';
import { studentCourseApi } from '../../api/student-course.api';
import { userApi } from '../../api/user.api';
import { parseApiError } from '../../context/AuthContext';
import type { Course, CourseType } from '../../types/course.types';
import { StudentCourseCard } from '../../components/student/StudentCourseCard';

const uniqueCategories = (courses: Course[]): string[] => {
  const values = new Set(courses.map((course) => course.categoryName).filter(Boolean) as string[]);
  return Array.from(values);
};

export const StudentCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<number[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | CourseType>('all');
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async (): Promise<void> => {
      setLoading(true);
      setMessage('');
      setError('');

      try {
        const [all, categoriesFromApi, enrolled] = await Promise.all([
          studentCourseApi.getAllCourses(),
          userApi.getStudentProfileCategories().catch(() => []),
          studentCourseApi.getEnrolledCourses().catch(() => []),
        ]);

        setCourses(all);
        setEnrolledCourseIds(enrolled.map((item) => item.courseId));

        const finalCategories =
          categoriesFromApi.length > 0
            ? categoriesFromApi.map((category) => category.categoryName)
            : uniqueCategories(all);
        setCategoryOptions(finalCategories);
      } catch (err) {
        setError(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, []);

  const handleEnroll = async (courseId: number): Promise<void> => {
    setEnrollingCourseId(courseId);
    setMessage('');
    setError('');
    try {
      await studentCourseApi.enrollCourse(courseId);
      setEnrolledCourseIds((prev) => (prev.includes(courseId) ? prev : [...prev, courseId]));
      setMessage('Course enrolled successfully.');
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const filteredCourses = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        course.title.toLowerCase().includes(normalizedSearch) ||
        course.description.toLowerCase().includes(normalizedSearch);

      const matchesCategory = selectedCategory === 'all' || course.categoryName === selectedCategory;
      const matchesType = selectedType === 'all' || course.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [courses, searchText, selectedCategory, selectedType]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">All Courses</h2>
        <p className="text-sm text-slate-500">Search and filter courses by category and course type.</p>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_220px_180px]">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by title or description"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />

        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="all">All Categories</option>
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value as 'all' | CourseType)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="all">All Types</option>
          <option value="FREE">Free</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {message ? <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading courses...</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourses.map((course) => (
          <StudentCourseCard
            key={course.id}
            course={course}
            canEnroll={!enrolledCourseIds.includes(course.id)}
            isEnrolling={enrollingCourseId === course.id}
            onEnroll={(id) => void handleEnroll(id)}
          />
        ))}
      </div>

      {!loading && filteredCourses.length === 0 ? (
        <p className="rounded-lg bg-white px-3 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          No courses match your filters.
        </p>
      ) : null}
    </section>
  );
};
