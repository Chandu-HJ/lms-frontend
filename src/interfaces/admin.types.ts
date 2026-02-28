export type UserAccountStatus = 'ACTIVE' | 'DEACTIVE' | 'PENDING';

export interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  avatarUrl: string | null;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  status: UserAccountStatus;
}

export interface AdminCourse {
  id: number;
  title: string;
  instructorName: string | null;
  instructorEmail: string | null;
  status: string;
  price: number | null;
}

export interface BasicApiResponse {
  success: boolean;
  message?: string;
}
