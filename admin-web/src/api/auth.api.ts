import client from './client';
import type {
  AdminLoginRequest,
  LoginResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from '@/types/auth';
import type { ApiResponse } from '@/types/api';

/** 관리자 로그인 - POST /api/auth/admin/login */
export async function adminLogin(
  req: AdminLoginRequest,
): Promise<LoginResponse> {
  const { data } = await client.post<ApiResponse<LoginResponse>>(
    '/auth/admin/login',
    req,
  );
  return data.data;
}

/** 토큰 갱신 - POST /api/auth/refresh */
export async function refreshToken(
  req: TokenRefreshRequest,
): Promise<TokenRefreshResponse> {
  const { data } = await client.post<ApiResponse<TokenRefreshResponse>>(
    '/auth/refresh',
    req,
  );
  return data.data;
}

/** 로그아웃 - POST /api/auth/logout */
export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}
