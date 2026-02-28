import api from './axiosInstance';
import { type ApiResponse } from '../interfaces/notification.types';
import { type AdminCourse, type AdminUser, type BasicApiResponse, type UserAccountStatus } from '../interfaces/admin.types';
import { type CourseCategory } from '../interfaces/course.types';

export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get<ApiResponse<AdminUser[]>>('/admin/user/all');
  return response.data.data ?? [];
};

export const getAdminUsersByStatus = async (status: UserAccountStatus): Promise<AdminUser[]> => {
  const response = await api.get<ApiResponse<AdminUser[]>>('/admin/user/status', {
    params: { status: status.toLowerCase() },
  });
  return response.data.data ?? [];
};

export const getAdminUsersByRole = async (role: AdminUser['role']): Promise<AdminUser[]> => {
  const response = await api.get<ApiResponse<AdminUser[]>>('/admin/user/role', {
    params: { role: role.toLowerCase() },
  });
  return response.data.data ?? [];
};

export const updateAdminUserStatus = async (id: number, status: UserAccountStatus): Promise<BasicApiResponse> => {
  const response = await api.patch<BasicApiResponse>('/admin/user/update-status', { id, status });
  return response.data;
};

export const getAdminCourses = async (): Promise<AdminCourse[]> => {
  const response = await api.get<ApiResponse<AdminCourse[]>>('/admin/course');
  return response.data.data ?? [];
};

export const addAdminCategory = async (name: string): Promise<BasicApiResponse> => {
  const response = await api.post<BasicApiResponse>('/admin/category/add', { name });
  return response.data;
};

export const getAdminCategories = async (): Promise<CourseCategory[]> => {
  const response = await api.get<ApiResponse<CourseCategory[]>>('/admin/categories');
  return response.data.data ?? [];
};
