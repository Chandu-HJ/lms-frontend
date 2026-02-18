import { useEffect, useMemo, useState } from 'react';
import { CourseCard } from '../../components/CourseCard';
import { parseApiError } from '../../context/AuthContext';
import { instructorService } from '../../services/instructor.service';
import type { Course, CourseCategory } from '../../types/course.types';

export const InstructorCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const [allCourses, categoryOptions] = await Promise.all([
        instructorService.getAllCourses(),
        instructorService.getCategories(),
      ]);
      setCourses(allCourses);
      setCategories(categoryOptions);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const visibleCourses = useMemo(() => {
    const byTitle = courses.filter((course) =>
      course.title.toLowerCase().includes(searchText.trim().toLowerCase()),
    );

    if (selectedCategory === 'all') {
      return byTitle;
    }

    return byTitle.filter((course) => {
      if (!course.categoryName) {
        return false;
      }
      return course.categoryName === selectedCategory;
    });
  }, [courses, searchText, selectedCategory]);

  const handleAction = async (action: () => Promise<void>, successMessage: string): Promise<void> => {
    setError('');
    setMessage('');

    try {
      await action();
      setMessage(successMessage);
      await loadData();
    } catch (err) {
      setError(parseApiError(err).message);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
          <p className="text-sm text-slate-500">Manage existing courses and statuses.</p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1fr_240px]">
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by title"
          className="rounded-lg border border-slate-300 px-3 py-2"
        />
        <select
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.categoryName} value={category.categoryName}>
              {category.categoryName}
            </option>
          ))}
        </select>
      </div>

      {message ? <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      {selectedCategory !== 'all' && courses.some((course) => !course.categoryName) ? (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-700">
          Category filter depends on `categoryName` in course payload. Current backend DTO may omit it.
        </p>
      ) : null}

      {loading ? <p className="text-sm text-slate-500">Loading courses...</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onArchive={(courseId) =>
              void handleAction(() => instructorService.archiveCourse(courseId), 'Course archived successfully.')
            }
            onActivate={(courseId) =>
              void handleAction(() => instructorService.activateCourse(courseId), 'Course activated successfully.')
            }
            onDuplicate={(courseId) =>
              void handleAction(() => instructorService.duplicateCourse(courseId), 'Course duplicated successfully.')
            }
          />
        ))}
      </div>

      {!loading && visibleCourses.length === 0 ? (
        <p className="rounded-lg bg-white px-3 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
          No courses match the current filter.
        </p>
      ) : null}
    </section>
  );
};
