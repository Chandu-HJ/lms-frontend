import { type AccountStatus, type UserRole } from '../interfaces/auth.types';

const LMS_USER_KEY = 'lms_user';

export interface SessionUser {
  id: number;
  userName: string;
  role: UserRole;
  avatarUrl: string;
  status: AccountStatus;
}

export const saveSessionUser = (user: SessionUser): void => {
  sessionStorage.setItem(LMS_USER_KEY, JSON.stringify(user));
};

export const getSessionUser = (): SessionUser | null => {
  const rawUser = sessionStorage.getItem(LMS_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as SessionUser;
  } catch {
    sessionStorage.removeItem(LMS_USER_KEY);
    return null;
  }
};

export const clearSessionUser = (): void => {
  sessionStorage.removeItem(LMS_USER_KEY);
};

export const updateSessionUserStatus = (status: AccountStatus): void => {
  const currentUser = getSessionUser();
  if (!currentUser) return;
  saveSessionUser({ ...currentUser, status });
};
