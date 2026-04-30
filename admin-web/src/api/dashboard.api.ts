import client from './client';
import type { DashboardData } from '@/types/dashboard';
import type { ApiResponseV2 } from '@/types/api';

/** 대시보드 데이터 조회 - GET /api/stores/{storeId}/dashboard */
export async function getDashboard(
  storeId: number,
): Promise<DashboardData> {
  const { data } = await client.get<ApiResponseV2<DashboardData>>(
    `/stores/${storeId}/dashboard`,
  );
  return data.data;
}
