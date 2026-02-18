import { apiClient } from './axios';
import type { ApiResponse } from '../types/auth.types';
import type { Course, CourseCategory, CourseCreateRequest } from '../types/course.types';
import type { Lesson, LessonCreateRequest } from '../types/lesson.types';
import type { Module, ModuleCreateRequest } from '../types/module.types';

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.data === undefined) {
    throw { status: 500, message: 'Invalid response payload' };
  }

  return response.data;
};

export const instructorService = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<ApiResponse<Course[]>>('/lms/instructor/course/all');
    return unwrap(response.data);
  },

  getActiveCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<ApiResponse<Course[]>>('/lms/instructor/course/active');
    return unwrap(response.data);
  },

  getArchivedCourses: async (): Promise<Course[]> => {
    const response = await apiClient.get<ApiResponse<Course[]>>('/lms/instructor/course/archived');
    return unwrap(response.data);
  },

  getCategories: async (): Promise<CourseCategory[]> => {
    const response = await apiClient.get<ApiResponse<CourseCategory[]>>('/lms/instructor/course/categories');
    return unwrap(response.data);
  },

  createCourse: async (payload: CourseCreateRequest): Promise<void> => {
    await apiClient.post('/lms/instructor/course/add', payload);
  },

  archiveCourse: async (courseId: number): Promise<void> => {
    await apiClient.patch('/lms/instructor/course/make-archive', null, {
      params: { 'course-id': courseId },
    });
  },

  activateCourse: async (courseId: number): Promise<void> => {
    await apiClient.patch('/lms/instructor/course/make-active', null, {
      params: { 'course-id': courseId },
    });
  },

  duplicateCourse: async (courseId: number): Promise<void> => {
    await apiClient.post('/lms/instructor/course/duplicate', null, {
      params: { 'course-id': courseId },
    });
  },

  getModulesByCourseId: async (courseId: number): Promise<Module[]> => {
    const response = await apiClient.get<ApiResponse<Module[]>>('/lms/instructor/course/module/all', {
      params: { 'course-id': courseId },
    });

    return unwrap(response.data);
  },

  addModule: async (payload: ModuleCreateRequest): Promise<void> => {
    await apiClient.post('/lms/instructor/course/module/add', payload);
  },

  getLessonsByModuleId: async (moduleId: number): Promise<Lesson[]> => {
    const response = await apiClient.get<ApiResponse<Lesson[]>>('/lms/instructor/module/lesson/all', {
      params: { 'module-id': moduleId },
    });

    return unwrap(response.data);
  },

  addLesson: async (payload: LessonCreateRequest): Promise<void> => {
    await apiClient.post('/lms/instructor/module/lesson/add', payload);
  },
};
