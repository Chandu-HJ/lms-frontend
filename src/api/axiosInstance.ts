import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type { ApiError } from '../types/auth.types';

const toApiError = (error: AxiosError): ApiError => {
  const status = error.response?.status ?? 500;
  const responseData = error.response?.data;

  if (typeof responseData === 'string' && responseData.trim().length > 0) {
    return { status, message: responseData };
  }

  if (responseData && typeof responseData === 'object') {
    const messageValue = (responseData as Record<string, unknown>).message;
    if (typeof messageValue === 'string' && messageValue.trim().length > 0) {
      return { status, message: messageValue };
    }
  }

  return { status, message: error.message || 'Something went wrong' };
};

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => config);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(toApiError(error));
    }

    return Promise.reject({ status: 500, message: 'Unexpected error' } as ApiError);
  },
);
