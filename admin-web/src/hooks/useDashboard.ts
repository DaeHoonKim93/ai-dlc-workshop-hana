import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboard } from '@/api/dashboard.api';
import { useSSE } from './useSSE';
import type { TableDashboardData, SSEEventType, SSENewOrderEvent } from '@/types/dashboard';
import type { SSEOrderDeletedEvent, SSETableResetEvent } from '@/types/sse';

interface UseDashboardOptions {
  storeId: number | null;
}

export function useDashboard({ storeId }: UseDashboardOptions) {
  const [tables, setTables] = useState<TableDashboardData[]>([]);
  const [highlightedTableIds, setHighlightedTableIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const highlightTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const fetchDashboard = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboard(storeId);
      setTables(data.tables);
    } catch {
      setError('대시보드 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const highlightTable = useCallback((tableId: number) => {
    setHighlightedTableIds((prev) => new Set(prev).add(tableId));
    const existing = highlightTimers.current.get(tableId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      setHighlightedTableIds((prev) => {
        const next = new Set(prev);
        next.delete(tableId);
        return next;
      });
      highlightTimers.current.delete(tableId);
    }, 3000);
    highlightTimers.current.set(tableId, timer);
  }, []);

  const handleSSEEvent = useCallback(
    (eventType: SSEEventType, data: unknown) => {
      if (eventType === 'NEW_ORDER') {
        const event = data as SSENewOrderEvent;
        highlightTable(event.tableId);
        // 대시보드 전체 새로고침 (간단한 전략)
        fetchDashboard();
      } else if (eventType === 'ORDER_STATUS_CHANGED') {
        fetchDashboard();
      } else if (eventType === 'ORDER_DELETED') {
        const event = data as SSEOrderDeletedEvent;
        void event;
        fetchDashboard();
      } else if (eventType === 'TABLE_RESET') {
        const event = data as SSETableResetEvent;
        void event;
        fetchDashboard();
      }
    },
    [fetchDashboard, highlightTable],
  );

  const { isConnected } = useSSE({ storeId, onEvent: handleSSEEvent });

  // 타이머 정리
  useEffect(() => {
    return () => {
      highlightTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  return {
    tables,
    highlightedTableIds,
    loading,
    error,
    isConnected,
    refresh: fetchDashboard,
  };
}
