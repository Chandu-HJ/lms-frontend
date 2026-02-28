import api from "./axiosInstance"
import { type RegisterRequest,type LoginRequest, type LoginResponse  } from '../interfaces/auth.types';

export const registerUser = async (data: RegisterRequest) => {
  // Post to your local endpoint [cite: 6]
  const response = await api.post('/user/register', data);
  return response.data;
};


export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};