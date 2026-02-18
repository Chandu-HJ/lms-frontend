import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types/auth.types';
import type { CourseCategory } from '../types/course.types';
import type {
  CategoryCreateRequest,
  StudentProfileRequest,
  UpdateUserStatusRequest,
  UserSummary,
} from '../types/user.types';

const mapProfilePayload = (payload: StudentProfileRequest): { Bio: string; interests: string[] } => ({
  Bio: payload.bio,
  interests: payload.interests,
});

export const userApi = {
  addStudentProfile: async (payload: StudentProfileRequest): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/student/profile/add', mapProfilePayload(payload));
  },

  updateStudentProfile: async (payload: StudentProfileRequest): Promise<void> => {
    await axiosInstance.patch<ApiResponse<null>>('/lms/student/profile/update', mapProfilePayload(payload));
  },

  getStudentInterests: async (): Promise<string[]> => {
    const response = await axiosInstance.get<ApiResponse<string[]>>('/lms/student/profile/interests');
    return response.data.data ?? [];
  },

  getStudentProfileCategories: async (): Promise<CourseCategory[]> => {
    const response = await axiosInstance.get<ApiResponse<CourseCategory[]>>('/lms/student/profile/categories');
    return response.data.data ?? [];
  },

  getAllUsers: async (): Promise<UserSummary[]> => {
    const response = await axiosInstance.get<ApiResponse<UserSummary[]>>('/lms/admin/user/all');
    return response.data.data ?? [];
  },

  updateUserStatus: async (payload: UpdateUserStatusRequest): Promise<void> => {
    await axiosInstance.patch<ApiResponse<null>>('/lms/admin/user/update-status', payload);
  },

  addCategory: async (payload: CategoryCreateRequest): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/admin/category/add', payload);
  },
};
