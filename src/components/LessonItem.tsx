import type { Lesson } from '../types/lesson.types';

interface LessonItemProps {
  lesson: Lesson;
}

export const LessonItem = ({ lesson }: LessonItemProps) => {
  return (
    <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-900">{lesson.title}</p>
        <span className="text-xs text-slate-500">Order {lesson.orderIndex}</span>
      </div>
      {lesson.textContent ? <p className="mt-2 text-sm text-slate-600">{lesson.textContent}</p> : null}
      {lesson.videoUrl ? (
        <a
          href={lesson.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Open Video
        </a>
      ) : null}
    </li>
  );
};
