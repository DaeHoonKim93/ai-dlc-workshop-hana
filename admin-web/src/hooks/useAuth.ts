import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { adminLogin, logout as apiLogout } from '@/api/auth.api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/api/client';
import type { AdminLoginRequest, AuthState, Role } from '@/types/auth';

const STORE_ID_KEY = 'storeId';
const STAFF_ID_KEY = 'staffId';
const ROLE_KEY = 'role';

function loadAuthState(): AuthState {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const role = localStorage.getItem(ROLE_KEY) as Role | null;
  const storeId = localStorage.getItem(STORE_ID_KEY);
  const staffId = localStorage.getItem(STAFF_ID_KEY);

  return {
    accessToken,
    refreshToken,
    role,
    storeId: storeId ? Number(storeId) : null,
    staffId: staffId ? Number(staffId) : null,
    isAuthenticated: !!accessToken,
  };
}

export function useAuthProvider() {
  const [auth, setAuth] = useState<AuthState>(loadAuthState);

  const login = useCallback(async (req: AdminLoginRequest) => {
    const res = await adminLogin(req);
    setTokens(res.accessToken, res.refreshToken);
    localStorage.setItem(STORE_ID_KEY, String(res.storeId));
    localStorage.setItem(STAFF_ID_KEY, String(res.staffId));
    localStorage.setItem(ROLE_KEY, res.role);

    setAuth({
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
      role: res.role,
      storeId: res.storeId,
      staffId: res.staffId,
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
    localStorage.removeItem(STORE_ID_KEY);
    localStorage.removeItem(STAFF_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
    setAuth({
      accessToken: null,
      refreshToken: null,
      role: null,
      storeId: null,
      staffId: null,
      isAuthenticated: false,
    });
  }, []);

  const isManager = auth.role === 'MANAGER';
  const isStaff = auth.role === 'STAFF';

  return { auth, login, logout: logoutFn, isManager, isStaff };
}

/** Auth Context */
interface AuthContextType {
  auth: AuthState;
  login: (req: AdminLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isManager: boolean;
  isStaff: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
