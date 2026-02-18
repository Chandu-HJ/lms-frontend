import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types/auth.types';
import type { Course, CourseType } from '../types/course.types';
import type { EnrolledCourseSummary } from '../types/student.types';

const extractList = <T>(payload: ApiResponse<T[]> | T[]): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.data ?? [];
};

export const studentCourseApi = {
  getAllCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]> | Course[]>('/lms/student/course/all');
    return extractList(response.data);
  },

  getEnrolledCourses: async (): Promise<EnrolledCourseSummary[]> => {
    const response = await axiosInstance.get<ApiResponse<EnrolledCourseSummary[]> | EnrolledCourseSummary[]>(
      '/lms/student/course/enrolled-courses',
    );
    return extractList(response.data);
  },

  getCoursesByCategory: async (categoryName: string): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]> | Course[]>('/lms/student/course/category', {
      params: { 'category-name': categoryName },
    });
    return extractList(response.data);
  },

  getCoursesByType: async (courseType: CourseType): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]> | Course[]>('/lms/student/course/course-type', {
      params: { 'course-type': courseType },
    });
    return extractList(response.data);
  },

  getInterestedCategoryCourses: async (): Promise<Course[]> => {
    const response = await axiosInstance.get<ApiResponse<Course[]> | Course[]>(
      '/lms/student/course/interested-category',
    );
    return extractList(response.data);
  },

  enrollCourse: async (courseId: number): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/student/course/enroll', { courseId });
  },
};
