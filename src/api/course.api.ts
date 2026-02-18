import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types/auth.types';
import type { Course, CourseCategory, CourseCreateRequest } from '../types/course.types';

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.data === undefined) {
    throw { status: 500, message: 'Invalid API response' };
  }

  return response.data;
};

export const courseApi = {
  addCourse: async (payload: CourseCreateRequest): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/instructor/course/add', payload);
  },

  getAllCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>('/lms/instructor/course/all');
    return unwrap(response.data);
  },

  getArchivedCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>('/lms/instructor/course/archived');
    return unwrap(response.data);
  },

  getActiveCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]>>('/lms/instructor/course/active');
    return unwrap(response.data);
  },

  getCategories: async (): Promise<CourseCategory[]> => {
    const response = await axiosInstance.get<ApiResponse<CourseCategory[]>>('/lms/instructor/course/categories');
    return unwrap(response.data);
  },

  duplicateCourse: async (courseId: number): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/instructor/course/duplicate', null, {
      params: { 'course-id': courseId },
    });
  },

  archiveCourse: async (courseId: number): Promise<void> => {
    await axiosInstance.patch<ApiResponse<null>>('/lms/instructor/course/make-archive', null, {
      params: { 'course-id': courseId },
    });
  },

  activateCourse: async (courseId: number): Promise<void> => {
    await axiosInstance.patch<ApiResponse<null>>('/lms/instructor/course/make-active', null, {
      params: { 'course-id': courseId },
    });
  },
};
