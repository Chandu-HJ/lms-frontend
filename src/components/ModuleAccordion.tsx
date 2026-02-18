import { useState, type FormEvent } from 'react';
import type { LessonCreateRequest } from '../types/lesson.types';
import type { Module } from '../types/module.types';
import type { Lesson } from '../types/lesson.types';
import { LessonItem } from './LessonItem';

interface ModuleAccordionProps {
  module: Module;
  lessons: Lesson[];
  isLoadingLessons: boolean;
  onToggle: (moduleId: number, nextExpanded: boolean) => void;
  onAddLesson: (payload: LessonCreateRequest) => Promise<void>;
}

export const ModuleAccordion = ({
  module,
  lessons,
  isLoadingLessons,
  onToggle,
  onAddLesson,
}: ModuleAccordionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [orderIndex, setOrderIndex] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleExpand = (): void => {
    const next = !expanded;
    setExpanded(next);
    onToggle(module.id, next);
  };

  const handleAddLesson = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onAddLesson({
        title: lessonTitle,
        moduleId: module.id,
        videoUrl: videoUrl || undefined,
        textContent: textContent || undefined,
        orderIndex: orderIndex ? Number(orderIndex) : undefined,
      });
      setLessonTitle('');
      setVideoUrl('');
      setTextContent('');
      setOrderIndex('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={handleExpand}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
      >
        <div>
          <h4 className="font-semibold text-slate-900">{module.title}</h4>
          <p className="text-xs text-slate-500">Order {module.orderIndex}</p>
        </div>
        <span className="text-sm font-medium text-blue-600">{expanded ? 'Hide' : 'View'} Lessons</span>
      </button>

      {expanded ? (
        <div className="space-y-4 border-t border-slate-200 p-4">
          {isLoadingLessons ? <p className="text-sm text-slate-500">Loading lessons...</p> : null}

          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <LessonItem key={`${module.id}-${lesson.title}-${lesson.orderIndex}`} lesson={lesson} />
            ))}
          </ul>

          <form onSubmit={handleAddLesson} className="grid gap-3 rounded-lg bg-slate-50 p-3 md:grid-cols-2">
            <input
              value={lessonTitle}
              onChange={(event) => setLessonTitle(event.target.value)}
              placeholder="Lesson title"
              className="rounded-lg border border-slate-300 px-3 py-2"
              required
            />
            <input
              value={orderIndex}
              onChange={(event) => setOrderIndex(event.target.value)}
              placeholder="Order index (optional)"
              type="number"
              min="0"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="Video URL"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <input
              value={textContent}
              onChange={(event) => setTextContent(event.target.value)}
              placeholder="Text content"
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Adding...' : 'Add Lesson'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
};
