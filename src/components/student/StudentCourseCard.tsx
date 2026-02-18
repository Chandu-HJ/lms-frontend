import type { Course } from '../../types/course.types';

interface StudentCourseCardProps {
  course: Course;
  canEnroll?: boolean;
  isEnrolling?: boolean;
  onEnroll?: (courseId: number) => void;
}

const formatPrice = (course: Course): string => {
  if (course.type === 'FREE') {
    return 'Free';
  }
  if (typeof course.price === 'number') {
    return `$${course.price.toFixed(2)}`;
  }
  return 'Paid';
};

export const StudentCourseCard = ({ course, canEnroll = false, isEnrolling = false, onEnroll }: StudentCourseCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="h-36 w-full bg-slate-200">
        <img
          src={course.coverImageUrl || 'https://placehold.co/480x320?text=Course'}
          alt={course.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-3 p-4">
        {onEnroll ? (
          <div className="flex justify-end">
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100">
                ...
              </summary>
              <div className="absolute right-0 z-10 mt-1 min-w-[150px] rounded-lg border border-slate-200 bg-white p-1 shadow-md">
                <button
                  type="button"
                  disabled={!canEnroll || isEnrolling}
                  onClick={() => onEnroll(course.id)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                    canEnroll
                      ? 'text-slate-700 hover:bg-slate-100 disabled:opacity-60'
                      : 'cursor-not-allowed text-slate-400'
                  }`}
                >
                  {canEnroll ? (isEnrolling ? 'Enrolling...' : 'Enroll') : 'Already Enrolled'}
                </button>
              </div>
            </details>
          </div>
        ) : null}

        <h3 className="line-clamp-2 min-h-[3rem] text-sm font-semibold text-slate-900">{course.title}</h3>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{course.level}</span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              course.type === 'FREE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {course.type}
          </span>
          {course.categoryName ? (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{course.categoryName}</span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-900">{formatPrice(course)}</span>
          <span className="text-slate-500">{course.language}</span>
        </div>

      </div>
    </article>
  );
};
