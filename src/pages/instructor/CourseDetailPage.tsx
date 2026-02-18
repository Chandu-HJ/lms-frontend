import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { ModuleAccordion } from '../../components/ModuleAccordion';
import { parseApiError } from '../../context/AuthContext';
import { instructorService } from '../../services/instructor.service';
import type { Course } from '../../types/course.types';
import type { LessonCreateRequest, Lesson } from '../../types/lesson.types';
import type { Module } from '../../types/module.types';

export const CourseDetailPage = () => {
  const { courseId } = useParams();
  const numericCourseId = Number(courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<number, Lesson[]>>({});
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLessonsModuleId, setLoadingLessonsModuleId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleOrderIndex, setModuleOrderIndex] = useState('');
  const [addingModule, setAddingModule] = useState(false);

  const isValidCourseId = useMemo(() => Number.isFinite(numericCourseId) && numericCourseId > 0, [numericCourseId]);

  const loadCourseAndModules = async (): Promise<void> => {
    if (!isValidCourseId) {
      setError('Invalid course id.');
      return;
    }

    setError('');
    setLoadingModules(true);

    try {
      const [courses, moduleList] = await Promise.all([
        instructorService.getAllCourses(),
        instructorService.getModulesByCourseId(numericCourseId),
      ]);
      setCourse(courses.find((item) => item.id === numericCourseId) ?? null);
      setModules(moduleList);
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoadingModules(false);
    }
  };

  useEffect(() => {
    void loadCourseAndModules();
  }, [courseId]);

  const handleModuleToggle = async (moduleId: number, nextExpanded: boolean): Promise<void> => {
    if (!nextExpanded || lessonsByModule[moduleId]) {
      return;
    }

    setLoadingLessonsModuleId(moduleId);
    try {
      const lessons = await instructorService.getLessonsByModuleId(moduleId);
      setLessonsByModule((prev) => ({ ...prev, [moduleId]: lessons }));
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoadingLessonsModuleId(null);
    }
  };

  const handleAddModule = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');
    setMessage('');
    setAddingModule(true);

    try {
      await instructorService.addModule({
        title: moduleTitle,
        courseId: numericCourseId,
        orderIdx: moduleOrderIndex ? Number(moduleOrderIndex) : undefined,
      });
      setMessage('Module added.');
      setModuleTitle('');
      setModuleOrderIndex('');
      await loadCourseAndModules();
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setAddingModule(false);
    }
  };

  const handleAddLesson = async (payload: LessonCreateRequest): Promise<void> => {
    setError('');
    setMessage('');
    try {
      await instructorService.addLesson(payload);
      const lessons = await instructorService.getLessonsByModuleId(payload.moduleId);
      setLessonsByModule((prev) => ({ ...prev, [payload.moduleId]: lessons }));
      setMessage('Lesson added.');
    } catch (err) {
      setError(parseApiError(err).message);
      throw err;
    }
  };

  return (
    <section className="space-y-4">
      {course ? (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">{course.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{course.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-md bg-slate-100 px-2 py-1">{course.level}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1">{course.type}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1">{course.status}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Course Details</h2>
          <p className="text-sm text-slate-500">Course information unavailable for this id.</p>
        </div>
      )}

      {message ? <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <section className="space-y-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Add Module</h3>
        <form onSubmit={handleAddModule} className="grid gap-3 md:grid-cols-3">
          <input
            value={moduleTitle}
            onChange={(event) => setModuleTitle(event.target.value)}
            placeholder="Module title"
            className="rounded-lg border border-slate-300 px-3 py-2"
            required
          />
          <input
            value={moduleOrderIndex}
            onChange={(event) => setModuleOrderIndex(event.target.value)}
            placeholder="Order index (optional)"
            type="number"
            min="0"
            className="rounded-lg border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={addingModule}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {addingModule ? 'Adding...' : 'Add Module'}
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900">Modules</h3>
        {loadingModules ? <p className="text-sm text-slate-500">Loading modules...</p> : null}
        {modules.map((module) => (
          <ModuleAccordion
            key={module.id}
            module={module}
            lessons={lessonsByModule[module.id] ?? []}
            isLoadingLessons={loadingLessonsModuleId === module.id}
            onToggle={(moduleId, nextExpanded) => {
              void handleModuleToggle(moduleId, nextExpanded);
            }}
            onAddLesson={handleAddLesson}
          />
        ))}
      </section>
    </section>
  );
};
