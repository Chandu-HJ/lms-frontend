import type { Role, UserStatus } from './auth.types';

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseType = 'FREE' | 'PAID';
export type CourseStatus = 'ARCHIVE' | 'ACTIVE';

export interface CourseInstructor {
  id: number;
  email: string;
  firstName: string;
  avatarUrl?: string;
  role: Role;
  status: UserStatus;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: CourseLevel;
  type: CourseType;
  categoryName?: string;
  language: string;
  coverImageUrl?: string;
  previewVideoUrl?: string;
  price?: number;
  createdAt?: string;
  instructor?: CourseInstructor;
  status: CourseStatus;
}

export interface CourseCreateRequest {
  title: string;
  description: string;
  level: CourseLevel;
  type: CourseType;
  language: string;
  coverImageUrl?: string;
  previewVideoUrl?: string;
  price?: number;
  categoryName: string;
  status?: CourseStatus;
}

export interface CourseCategory {
  categoryName: string;
}
