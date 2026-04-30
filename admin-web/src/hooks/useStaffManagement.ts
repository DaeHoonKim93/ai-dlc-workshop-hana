import { useState, useCallback } from 'react';
import { getStaffList, createStaff, updateStaff, deleteStaff } from '@/api/staff.api';
import type { Staff, StaffCreateRequest, StaffUpdateRequest } from '@/types/staff';
import { showToast } from '@/components/Toast';

export function useStaffManagement(storeId: number | null) {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStaffList(storeId);
      setStaffList(data);
    } catch {
      setError('직원 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  const addStaff = useCallback(async (req: StaffCreateRequest) => {
    if (!storeId) return;
    await createStaff(storeId, req);
    showToast('success', '직원이 등록되었습니다.');
    await fetchStaff();
  }, [storeId, fetchStaff]);

  const editStaff = useCallback(async (staffId: number, req: StaffUpdateRequest) => {
    if (!storeId) return;
    await updateStaff(storeId, staffId, req);
    showToast('success', '직원 정보가 수정되었습니다.');
    await fetchStaff();
  }, [storeId, fetchStaff]);

  const removeStaff = useCallback(async (staffId: number) => {
    if (!storeId) return;
    await deleteStaff(storeId, staffId);
    showToast('success', '직원이 삭제되었습니다.');
    await fetchStaff();
  }, [storeId, fetchStaff]);

  return { staffList, loading, error, fetchStaff, addStaff, editStaff, removeStaff };
}
