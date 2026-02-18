import { axiosInstance } from './axiosInstance';
import type {
  ApiResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../types/auth.types';

export const authApi = {
  login: async (payload: LoginRequest): Promise<AuthUser> => {
    const response = await axiosInstance.post<ApiResponse<AuthUser>>('/lms/auth/login', payload);
    if (!response.data.data) {
      throw { status: 500, message: 'Invalid login response' };
    }
    return response.data.data;
  },

  signup: async (payload: RegisterRequest): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post<ApiResponse<null>>('/lms/user/register', payload);
    return response.data;
  },
};
