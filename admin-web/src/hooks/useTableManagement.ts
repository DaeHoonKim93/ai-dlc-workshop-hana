import { useState, useCallback } from 'react';
import { getTables, createTable, completeTable, getTableHistory } from '@/api/table.api';
import type { Table, TableCreateRequest } from '@/types/table';
import type { OrderHistory } from '@/types/order';
import type { PaginatedData } from '@/types/api';
import { showToast } from '@/components/Toast';

export function useTableManagement(storeId: number | null) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTables(storeId);
      setTables(data);
    } catch {
      setError('테이블 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const addTable = useCallback(
    async (req: TableCreateRequest) => {
      if (!storeId) return;
      await createTable(storeId, req);
      showToast('success', '테이블이 등록되었습니다.');
      await fetchTables();
    },
    [storeId, fetchTables],
  );

  const completeTableSession = useCallback(
    async (tableId: number) => {
      if (!storeId) return;
      await completeTable(storeId, tableId);
      showToast('success', '이용 완료 처리되었습니다.');
      await fetchTables();
    },
    [storeId, fetchTables],
  );

  const fetchHistory = useCallback(
    async (
      tableId: number,
      params?: { startDate?: string; endDate?: string; page?: number; size?: number },
    ): Promise<PaginatedData<OrderHistory>> => {
      if (!storeId) throw new Error('storeId is null');
      return getTableHistory({ storeId, tableId, ...params });
    },
    [storeId],
  );

  return { tables, loading, error, fetchTables, addTable, completeTableSession, fetchHistory };
}
