import api from './axiosInstance';
import { type DiscussionMessage } from '../interfaces/discussion.types';

type DiscussionRole = 'STUDENT' | 'INSTRUCTOR';

const studentBase = (courseId: number) => `/student/course/${courseId}/discussion`;
const instructorBase = (courseId: number) => `/instructor/courses/${courseId}/discussion`;

const parseContent = (raw: string): string => {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return '';

  // Backend currently stores bodies like:
  // { "hello" }
  const match = trimmed.match(/^\{\s*"([\s\S]*)"\s*\}$/);
  if (match?.[1]) {
    return match[1].replace(/\\"/g, '"').trim();
  }
  return trimmed.replace(/^"+|"+$/g, '');
};

const normalizeDiscussion = (message: DiscussionMessage): DiscussionMessage => ({
  ...message,
  content: parseContent(message.content),
  replies: (message.replies ?? []).map(normalizeDiscussion),
});

export const getCourseDiscussion = async (
  courseId: number,
  role: DiscussionRole
): Promise<DiscussionMessage[]> => {
  const url = role === 'STUDENT' ? studentBase(courseId) : instructorBase(courseId);
  const response = await api.get<DiscussionMessage[]>(url);
  return (response.data ?? []).map(normalizeDiscussion);
};

export const postCourseDiscussion = async (
  courseId: number,
  role: DiscussionRole,
  content: string,
  parentId?: number
): Promise<void> => {
  const url =
    role === 'STUDENT'
      ? studentBase(courseId)
      : instructorBase(courseId);

  if (role === 'STUDENT' && parentId != null) {
    // Student reply endpoint naming differs across backend builds.
    // Send both variants to keep replies working without backend-specific branching.
    await api.post(url, JSON.stringify(content), {
      params: {
        'parent-id': parentId,
        parentId,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return;
  }

  const params = parentId != null ? { parentId } : undefined;

  await api.post(url, JSON.stringify(content), {
    params,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const toggleDiscussionPin = async (courseId: number, messageId: number): Promise<void> => {
  await api.patch(`/instructor/courses/${courseId}/discussion/${messageId}/pin`);
};

export const toggleDiscussionBestAnswer = async (courseId: number, messageId: number): Promise<void> => {
  await api.patch(`/instructor/courses/${courseId}/discussion/${messageId}/best-answer`);
};
