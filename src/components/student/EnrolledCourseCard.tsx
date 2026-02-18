import type { EnrolledCourseSummary } from '../../types/student.types';

interface EnrolledCourseCardProps {
  course: EnrolledCourseSummary;
}

export const EnrolledCourseCard = ({ course }: EnrolledCourseCardProps) => {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="h-36 w-full bg-slate-200">
        <img
          src={course.coverImageUrl || 'https://placehold.co/480x320?text=Enrolled'}
          alt={course.title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 min-h-[3rem] text-sm font-semibold text-slate-900">{course.title}</h3>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{course.instructorName}</span>
          <span>{course.level}</span>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span>Progress</span>
            <span>{Math.round(course.progressPercentage)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${Math.min(Math.max(course.progressPercentage, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};
