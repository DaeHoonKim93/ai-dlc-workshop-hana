import { useState, useCallback } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '@/api/order.api';
import type { Order, OrderStatus } from '@/types/order';
import { showToast } from '@/components/Toast';

export function useOrderManagement(storeId: number | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (tableId?: number) => {
      if (!storeId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getOrders({ storeId, tableId });
        setOrders(data.content);
      } catch {
        setError('주문 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    },
    [storeId],
  );

  const changeStatus = useCallback(
    async (orderId: number, status: OrderStatus) => {
      if (!storeId) return;
      try {
        const updated = await updateOrderStatus(storeId, orderId, { status: status as 'ACCEPTED' | 'PREPARING' | 'COMPLETED' });
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updated : o)),
        );
        showToast('success', '주문 상태가 변경되었습니다.');
      } catch {
        showToast('error', '상태 변경에 실패했습니다.');
      }
    },
    [storeId],
  );

  const removeOrder = useCallback(
    async (orderId: number) => {
      if (!storeId) return;
      try {
        await deleteOrder(storeId, orderId);
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        showToast('success', '주문이 삭제되었습니다.');
      } catch {
        showToast('error', '주문 삭제에 실패했습니다.');
      }
    },
    [storeId],
  );

  return { orders, loading, error, fetchOrders, changeStatus, removeOrder };
}
