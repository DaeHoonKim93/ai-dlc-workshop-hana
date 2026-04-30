export type Role = 'MANAGER' | 'STAFF';

export interface AdminLoginRequest {
  storeCode: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
  storeId: number;
  staffId: number;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  storeId: number | null;
  staffId: number | null;
  isAuthenticated: boolean;
}
