export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
export const USER_COOKIE_KEY = 'lms_user';
export const USER_COOKIE_DAYS = 1;

export const ROLE_ROUTE_MAP = {
  STUDENT: '/student/profile/setup',
  INSTRUCTOR: '/instructor/dashboard',
  ADMIN: '/admin/dashboard',
} as const;
