export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'DEACTIVE' | 'PENDING';

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
}

// Add these to your existing file
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    userName: string;
    id: number;
    role: UserRole;
    status: AccountStatus;
    avatharUrl?: string;
    avatarUrl?: string;
  };
}
