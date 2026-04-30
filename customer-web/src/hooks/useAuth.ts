import { useState, useCallback, createContext, useContext } from 'react';
import { tableLogin, logout as apiLogout } from '@/api/auth.api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/api/client';
import { STORAGE_KEYS } from '@/utils/constants';
import type { TableLoginRequest, AuthState } from '@/types/auth';

function loadAuthState(): AuthState {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const storeId = localStorage.getItem(STORAGE_KEYS.STORE_ID);
  const tableId = localStorage.getItem(STORAGE_KEYS.TABLE_ID);

  return {
    accessToken,
    refreshToken,
    storeId: storeId ? Number(storeId) : null,
    tableId: tableId ? Number(tableId) : null,
    isAuthenticated: !!accessToken,
  };
}

export function useAuthProvider() {
  const [auth, setAuth] = useState<AuthState>(loadAuthState);

  const login = useCallback(async (req: TableLoginRequest) => {
    const res = await tableLogin(req);
    setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem(STORAGE_KEYS.STORE_ID, String(res.storeId));
    localStorage.setItem(STORAGE_KEYS.TABLE_ID, String(res.tableId));

    setAuth({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      storeId: res.storeId,
      tableId: res.tableId,
      isAuthenticated: true,
    });
  }, []);

  const logoutFn = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // 로그아웃 API 실패해도 로컬 토큰은 삭제
    }
    clearTokens();
    localStorage.removeItem(STORAGE_KEYS.STORE_ID);
    localStorage.removeItem(STORAGE_KEYS.TABLE_ID);
    setAuth({
      accessToken: null,
      refreshToken: null,
      storeId: null,
      tableId: null,
      isAuthenticated: false,
    });
  }, []);

  return { auth, login, logout: logoutFn };
}

/** Auth Context */
interface AuthContextType {
  auth: AuthState;
  login: (req: TableLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
