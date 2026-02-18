import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types/auth.types';
import type { Module, ModuleCreateRequest } from '../types/module.types';

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.data === undefined) {
    throw { status: 500, message: 'Invalid API response' };
  }
  return response.data;
};

export const moduleApi = {
  addModule: async (payload: ModuleCreateRequest): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/instructor/course/module/add', payload);
  },

  addModuleAfterIndex: async (payload: ModuleCreateRequest): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>('/lms/instructor/course/module/add/after-idx', payload);
  },

  deleteModule: async (moduleId: number): Promise<void> => {
    await axiosInstance.delete<ApiResponse<null>>('/lms/instructor/course/module/delete', {
      params: { 'module-id': moduleId },
    });
  },

  getAllModules: async (courseId: number): Promise<Module[]> => {
    const response = await axiosInstance.get<ApiResponse<Module[]>>('/lms/instructor/course/module/all', {
      params: { 'course-id': courseId },
    });
    return unwrap(response.data);
  },
};
