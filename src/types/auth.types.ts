export type Role = 'ADMIN' | 'STUDENT' | 'INSTRUCTOR';
export type UserStatus = 'ACTIVE' | 'DEACTIVE';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName?: string;
  password: string;
  role: Role;
}

export interface AuthUser {
  id: number;
  userName: string;
  role: Role;
  status: UserStatus;
  avatharUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiError {
  status: number;
  message: string;
}
