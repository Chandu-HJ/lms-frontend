import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { ROLE_ROUTE_MAP, USER_COOKIE_DAYS, USER_COOKIE_KEY } from '../utils/constants';
import type {
  ApiError,
  AuthState,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '../types/auth.types';

interface AuthContextValue extends AuthState {
  login: (payload: LoginRequest) => Promise<void>;
  signup: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  getHomeRouteByRole: (user: AuthUser) => string;
}

const defaultState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  const prefix = `${name}=`;
  const parts = document.cookie.split(';').map((part) => part.trim());
  const found = parts.find((part) => part.startsWith(prefix));
  if (!found) {
    return null;
  }
  return decodeURIComponent(found.substring(prefix.length));
};

const removeCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

const readUserCookie = (): AuthUser | null => {
  const raw = getCookie(USER_COOKIE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    removeCookie(USER_COOKIE_KEY);
    return null;
  }
};

const saveUserCookie = (user: AuthUser): void => {
  setCookie(USER_COOKIE_KEY, JSON.stringify(user), USER_COOKIE_DAYS);
};

const resolveRoleRoute = (user: AuthUser): string => ROLE_ROUTE_MAP[user.role] ?? '/auth/login';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>(defaultState);

  useEffect(() => {
    const user = readUserCookie();
    setState({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });
  }, []);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const user = await authApi.login(payload);
      saveUserCookie(user);
      setState({ user, isAuthenticated: true, isLoading: false });
      navigate(resolveRoleRoute(user), { replace: true });
    },
    [navigate],
  );

  const signup = useCallback(async (payload: RegisterRequest) => {
    await authApi.signup(payload);
  }, []);

  const logout = useCallback(() => {
    removeCookie(USER_COOKIE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
    navigate('/auth/login', { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      signup,
      logout,
      getHomeRouteByRole: resolveRoleRoute,
    }),
    [state, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const parseApiError = (error: unknown): ApiError => {
  if (error && typeof error === 'object') {
    const maybeError = error as Partial<ApiError>;
    if (typeof maybeError.message === 'string') {
      return {
        status: typeof maybeError.status === 'number' ? maybeError.status : 500,
        message: maybeError.message,
      };
    }
  }

  return { status: 500, message: 'Unexpected error' };
};
