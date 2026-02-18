import axios, { AxiosError } from 'axios';

export interface ServiceError {
  status: number;
  message: string;
}

const toServiceError = (error: AxiosError): ServiceError => {
  const status = error.response?.status ?? 500;
  const data = error.response?.data;

  if (typeof data === 'string' && data.trim().length > 0) {
    return { status, message: data };
  }

  if (data && typeof data === 'object') {
    const message = (data as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return { status, message };
    }
  }

  return { status, message: error.message || 'Request failed' };
};

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return Promise.reject(toServiceError(error));
    }

    return Promise.reject({ status: 500, message: 'Unexpected error occurred' } as ServiceError);
  },
);
