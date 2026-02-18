import { Link } from 'react-router-dom';
import type { Course } from '../types/course.types';

interface CourseCardProps {
  course: Course;
  onArchive: (courseId: number) => void;
  onActivate: (courseId: number) => void;
  onDuplicate: (courseId: number) => void;
}

const statusClassMap: Record<Course['status'], string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  ARCHIVE: 'bg-amber-100 text-amber-700',
};

export const CourseCard = ({ course, onArchive, onActivate, onDuplicate }: CourseCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="relative h-44 w-full bg-slate-200">
        <img
          src={course.coverImageUrl || 'https://placehold.co/640x360?text=No+Cover'}
          alt={course.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClassMap[course.status]}`}>
            {course.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-md bg-slate-100 px-2 py-1">{course.level}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1">{course.type}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1">{course.language}</span>
          {course.categoryName ? <span className="rounded-md bg-slate-100 px-2 py-1">{course.categoryName}</span> : null}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to={`/instructor/course/${course.id}`}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Edit
          </Link>

          {course.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => onArchive(course.id)}
              className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              Archive
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onActivate(course.id)}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Activate
            </button>
          )}

          <button
            type="button"
            onClick={() => onDuplicate(course.id)}
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Duplicate
          </button>
        </div>
      </div>
    </article>
  );
};
