import client from './client';
import type { CreateOrderRequest, Order } from '@/types/order';
import type { ApiResponseV2, PaginatedData } from '@/types/api';

/** 주문 생성 - POST /api/stores/{storeId}/orders */
export async function createOrder(
  storeId: number,
  req: CreateOrderRequest,
): Promise<Order> {
  const { data } = await client.post<ApiResponseV2<Order>>(
    `/stores/${storeId}/orders`,
    req,
    { timeout: 15000 },
  );
  return data.data;
}

/** 주문 목록 조회 - GET /api/stores/{storeId}/orders */
export async function getOrders(
  storeId: number,
  params: {
    tableId?: number;
    sessionId?: number;
    status?: string;
    page?: number;
    size?: number;
  } = {},
): Promise<PaginatedData<Order>> {
  const { data } = await client.get<ApiResponseV2<PaginatedData<Order>>>(
    `/stores/${storeId}/orders`,
    { params },
  );
  return data.data;
}
