import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types/auth.types';
import type { Lesson, LessonCreateRequest } from '../types/lesson.types';

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.data === undefined) {
    throw { status: 500, message: 'Invalid API response' };
  }
  return response.data;
};

export const lessonApi = {
  addLesson: async (payload: LessonCreateRequest): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/instructor/module/lesson/add', payload);
  },

  getAllLessons: async (moduleId: number): Promise<Lesson[]> => {
    const response = await axiosInstance.get<ApiResponse<Lesson[]>>('/lms/instructor/module/lesson/all', {
      params: { 'module-id': moduleId },
    });
    return unwrap(response.data);
  },
};
