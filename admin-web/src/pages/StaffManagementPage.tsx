import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStaffManagement } from '@/hooks/useStaffManagement';
import { LoadingSpinner, ErrorMessage, ConfirmDialog } from '@/components';
import { showToast } from '@/components/Toast';
import { formatDateTime } from '@/utils/format';
import type { Role } from '@/types/auth';
import { AxiosError } from 'axios';
import styles from './StaffManagementPage.module.css';

export default function StaffManagementPage() {
  const { auth } = useAuth();
  const { staffList, loading, error, fetchStaff, addStaff, editStaff, removeStaff } =
    useStaffManagement(auth.storeId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STAFF');
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const openForm = (staff?: { id: number; username: string; role: Role }) => {
    setShowForm(true);
    setFormError('');
    if (staff) {
      setEditingId(staff.id);
      setUsername(staff.username);
      setPassword('');
      setRole(staff.role);
    } else {
      setEditingId(null);
      setUsername('');
      setPassword('');
      setRole('STAFF');
    }
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!username.trim()) { setFormError('사용자명을 입력하세요.'); return; }
    if (!/^[a-zA-Z0-9]+$/.test(username.trim())) { setFormError('사용자명은 영문+숫자만 가능합니다.'); return; }
    if (!editingId && password.length < 8) { setFormError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (editingId && password && password.length < 8) { setFormError('비밀번호는 8자 이상이어야 합니다.'); return; }

    try {
      if (editingId) {
        await editStaff(editingId, {
          username: username.trim(),
          ...(password ? { password } : {}),
          role,
        });
      } else {
        await addStaff({ username: username.trim(), password, role });
      }
      setShowForm(false);
    } catch (err) {
      if (err instanceof AxiosError) {
        const code = err.response?.data?.error?.code ?? err.response?.data?.errorCode;
        if (code === 'DUPLICATE_RESOURCE' || err.response?.status === 409) {
          setFormError('이미 사용 중인 사용자명입니다.');
        } else {
          setFormError('저장에 실패했습니다.');
        }
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget === auth.staffId) {
      showToast('error', '자기 자신은 삭제할 수 없습니다.');
      setDeleteTarget(null);
      return;
    }
    try {
      await removeStaff(deleteTarget);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.error?.code === 'SELF_DELETE_NOT_ALLOWED') {
        showToast('error', '자기 자신은 삭제할 수 없습니다.');
      } else {
        showToast('error', '직원 삭제에 실패했습니다.');
      }
    }
    setDeleteTarget(null);
  };

  if (loading) return <LoadingSpinner message="직원 목록 로딩 중..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchStaff} />;

  return (
    <div>
      <div className={styles.topBar}>
        <h2 className={styles.heading}>직원 관리</h2>
        <button className={styles.addBtn} onClick={() => openForm()} type="button">+ 직원 등록</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>사용자명</th>
            <th>역할</th>
            <th>상태</th>
            <th>등록일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((s) => (
            <tr key={s.id}>
              <td className={styles.username}>{s.username}</td>
              <td><span className={`${styles.roleBadge} ${s.role === 'MANAGER' ? styles.manager : styles.staff}`}>{s.role === 'MANAGER' ? '매니저' : '스태프'}</span></td>
              <td>{s.isActive ? '활성' : '비활성'}</td>
              <td className={styles.date}>{formatDateTime(s.createdAt)}</td>
              <td>
                <div className={styles.actions}>
                  <button className={styles.editBtn} onClick={() => openForm(s)} type="button">수정</button>
                  <button className={styles.deleteBtn} onClick={() => setDeleteTarget(s.id)} type="button">삭제</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {staffList.length === 0 && <p className={styles.empty}>등록된 직원이 없습니다.</p>}

      {/* 등록/수정 모달 */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? '직원 수정' : '직원 등록'}</h3>
            {formError && <p className={styles.formError}>{formError}</p>}
            <label className={styles.formLabel}>사용자명 (영문+숫자) <input className={styles.formInput} value={username} onChange={(e) => setUsername(e.target.value)} maxLength={50} /></label>
            <label className={styles.formLabel}>비밀번호 {editingId && '(변경 시에만 입력)'} <input className={styles.formInput} type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
            <label className={styles.formLabel}>역할
              <select className={styles.formSelect} value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="MANAGER">매니저</option>
                <option value="STAFF">스태프</option>
              </select>
            </label>
            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => setShowForm(false)} type="button">취소</button>
              <button className={styles.submitBtn} onClick={handleSubmit} type="button">{editingId ? '수정' : '등록'}</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={deleteTarget !== null} title="직원 삭제" message="이 직원을 삭제(비활성화)하시겠습니까?" confirmLabel="삭제" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
