import client from './client';
import type {
  TableLoginRequest,
  TableLoginResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
} from '@/types/auth';
import type { ApiResponse } from '@/types/api';

/** 태블릿 로그인 - POST /api/auth/table/login */
export async function tableLogin(
  req: TableLoginRequest,
): Promise<TableLoginResponse> {
  const { data } = await client.post<ApiResponse<TableLoginResponse>>(
    '/auth/table/login',
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
