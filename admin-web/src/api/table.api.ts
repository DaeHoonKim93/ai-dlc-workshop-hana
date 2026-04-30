import client from './client';
import type {
  Table,
  TableCreateRequest,
  TableCreateResponse,
  TableCompleteResponse,
} from '@/types/table';
import type { OrderHistory } from '@/types/order';
import type { ApiResponseV2, PaginatedData } from '@/types/api';

/** 테이블 목록 조회 - GET /api/stores/{storeId}/tables */
export async function getTables(storeId: number): Promise<Table[]> {
  const { data } = await client.get<ApiResponseV2<Table[]>>(
    `/stores/${storeId}/tables`,
  );
  return data.data;
}

/** 테이블 등록 - POST /api/stores/{storeId}/tables */
export async function createTable(
  storeId: number,
  req: TableCreateRequest,
): Promise<TableCreateResponse> {
  const { data } = await client.post<ApiResponseV2<TableCreateResponse>>(
    `/stores/${storeId}/tables`,
    req,
  );
  return data.data;
}

/** 이용 완료 - POST /api/stores/{storeId}/tables/{tableId}/complete */
export async function completeTable(
  storeId: number,
  tableId: number,
): Promise<TableCompleteResponse> {
  const { data } = await client.post<ApiResponseV2<TableCompleteResponse>>(
    `/stores/${storeId}/tables/${tableId}/complete`,
  );
  return data.data;
}

interface HistoryParams {
  storeId: number;
  tableId: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

/** 과거 주문 내역 조회 - GET /api/stores/{storeId}/tables/{tableId}/history */
export async function getTableHistory(
  params: HistoryParams,
): Promise<PaginatedData<OrderHistory>> {
  const { storeId, tableId, ...query } = params;
  const { data } = await client.get<
    ApiResponseV2<PaginatedData<OrderHistory>>
  >(`/stores/${storeId}/tables/${tableId}/history`, { params: query });
  return data.data;
}
