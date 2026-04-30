export type TableRole = 'TABLE';

export interface TableLoginRequest {
  storeCode: string;     // NOT NULL, 1~50자
  tableNumber: string;   // NOT NULL, 1~20자
  password: string;      // NOT NULL, 8자 이상
}

export interface TableLoginResponse {
  accessToken: string;
  refreshToken: string;
  role: TableRole;
  storeId: number;
  tableId: number;
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
  storeId: number | null;
  tableId: number | null;
  isAuthenticated: boolean;
}
