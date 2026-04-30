import client from './client';
import type {
  Staff,
  StaffCreateRequest,
  StaffUpdateRequest,
} from '@/types/staff';
import type { ApiResponse } from '@/types/api';

/** 직원 목록 조회 - GET /api/stores/{storeId}/staff */
export async function getStaffList(storeId: number): Promise<Staff[]> {
  const { data } = await client.get<ApiResponse<Staff[]>>(
    `/stores/${storeId}/staff`,
  );
  return data.data;
}

/** 직원 등록 - POST /api/stores/{storeId}/staff */
export async function createStaff(
  storeId: number,
  req: StaffCreateRequest,
): Promise<Staff> {
  const { data } = await client.post<ApiResponse<Staff>>(
    `/stores/${storeId}/staff`,
    req,
  );
  return data.data;
}

/** 직원 수정 - PUT /api/stores/{storeId}/staff/{staffId} */
export async function updateStaff(
  storeId: number,
  staffId: number,
  req: StaffUpdateRequest,
): Promise<Staff> {
  const { data } = await client.put<ApiResponse<Staff>>(
    `/stores/${storeId}/staff/${staffId}`,
    req,
  );
  return data.data;
}

/** 직원 삭제 - DELETE /api/stores/{storeId}/staff/{staffId} */
export async function deleteStaff(
  storeId: number,
  staffId: number,
): Promise<void> {
  await client.delete(`/stores/${storeId}/staff/${staffId}`);
}
