import { useState, useCallback } from 'react';
import { createOrder as apiCreateOrder, getOrders } from '@/api/order.api';
import { useAuth } from './useAuth';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import type { Order, CreateOrderItemRequest } from '@/types/order';

export function useOrders() {
  const { auth } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const createOrder = useCallback(
    async (items: CreateOrderItemRequest[]): Promise<Order> => {
      if (!auth.storeId || !auth.tableId) {
        throw new Error('인증 정보가 없습니다');
      }

      setSubmitting(true);
      setError(null);
      try {
        const order = await apiCreateOrder(auth.storeId, {
          tableId: auth.tableId,
          items,
        });
        return order;
      } catch (err) {
        const message = extractErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [auth.storeId, auth.tableId],
  );

  const fetchOrders = useCallback(
    async (page = 0) => {
      if (!auth.storeId || !auth.tableId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getOrders(auth.storeId, {
          tableId: auth.tableId,
          page,
          size: DEFAULT_PAGE_SIZE,
        });

        if (page === 0) {
          setOrders(data.content);
        } else {
          setOrders((prev) => [...prev, ...data.content]);
        }
        setCurrentPage(page);
        setHasMore(!data.last);
      } catch (err) {
        setError('주문 내역을 불러올 수 없습니다');
        console.error('fetchOrders error:', err);
      } finally {
        setLoading(false);
      }
    },
    [auth.storeId, auth.tableId],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchOrders(currentPage + 1);
  }, [hasMore, loading, currentPage, fetchOrders]);

  return {
    orders,
    loading,
    submitting,
    error,
    hasMore,
    createOrder,
    fetchOrders,
    loadMore,
  };
}

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string; error?: { message?: string } } } }).response;
    return response?.data?.message || response?.data?.error?.message || '주문에 실패했습니다';
  }
  if (err instanceof Error && err.message === 'Network Error') {
    return '네트워크 연결을 확인해주세요';
  }
  return '주문에 실패했습니다';
}
