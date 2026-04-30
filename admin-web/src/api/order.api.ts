import client from './client';
import type { Order, OrderStatusUpdateRequest } from '@/types/order';
import type { ApiResponseV2, PaginatedData } from '@/types/api';

interface OrderListParams {
  storeId: number;
  tableId?: number;
  sessionId?: number;
  status?: string;
  page?: number;
  size?: number;
}

/** 주문 목록 조회 - GET /api/stores/{storeId}/orders */
export async function getOrders(
  params: OrderListParams,
): Promise<PaginatedData<Order>> {
  const { storeId, ...query } = params;
  const { data } = await client.get<ApiResponseV2<PaginatedData<Order>>>(
    `/stores/${storeId}/orders`,
    { params: query },
  );
  return data.data;
}

/** 주문 상세 조회 - GET /api/stores/{storeId}/orders/{orderId} */
export async function getOrder(
  storeId: number,
  orderId: number,
): Promise<Order> {
  const { data } = await client.get<ApiResponseV2<Order>>(
    `/stores/${storeId}/orders/${orderId}`,
  );
  return data.data;
}

/** 주문 상태 변경 - PUT /api/stores/{storeId}/orders/{orderId}/status */
export async function updateOrderStatus(
  storeId: number,
  orderId: number,
  req: OrderStatusUpdateRequest,
): Promise<Order> {
  const { data } = await client.put<ApiResponseV2<Order>>(
    `/stores/${storeId}/orders/${orderId}/status`,
    req,
  );
  return data.data;
}

/** 주문 삭제 - DELETE /api/stores/{storeId}/orders/{orderId} */
export async function deleteOrder(
  storeId: number,
  orderId: number,
): Promise<void> {
  await client.delete(`/stores/${storeId}/orders/${orderId}`);
}
