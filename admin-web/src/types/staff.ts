import type { Role } from './auth';

export interface Staff {
  id: number;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface StaffCreateRequest {
  username: string;
  password: string;
  role: Role;
}

export interface StaffUpdateRequest {
  username?: string;
  password?: string;
  role?: Role;
}
