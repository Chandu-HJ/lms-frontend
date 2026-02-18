import type { Role, UserStatus } from './auth.types';

export interface StudentProfileRequest {
  bio: string;
  interests: string[];
}

export interface UserSummary {
  id: number;
  email: string;
  firstName: string;
  avatarUrl?: string;
  role: Role;
  status: UserStatus;
}

export interface UpdateUserStatusRequest {
  email: string;
  status: UserStatus;
}

export interface CategoryCreateRequest {
  name: string;
}
