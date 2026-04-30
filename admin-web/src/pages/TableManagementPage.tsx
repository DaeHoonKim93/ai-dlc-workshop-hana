import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTableManagement } from '@/hooks/useTableManagement';
import { LoadingSpinner, ErrorMessage, ConfirmDialog, Pagination } from '@/components';
import { showToast } from '@/components/Toast';
import { formatPrice, formatDateTime } from '@/utils/format';
import type { OrderHistory } from '@/types/order';
import type { PaginatedData } from '@/types/api';
import { AxiosError } from 'axios';
import styles from './TableManagementPage.module.css';

export default function TableManagementPage() {
  const { auth, isManager } = useAuth();
  const { tables, loading, error, fetchTables, addTable, completeTableSession, fetchHistory } =
    useTableManagement(auth.storeId);

  // 테이블 등록 폼
  const [showForm, setShowForm] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  // 이용 완료
  const [completeTarget, setCompleteTarget] = useState<number | null>(null);

  // 과거 내역 모달
  const [historyTableId, setHistoryTableId] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<PaginatedData<OrderHistory> | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateTable = async () => {
    setFormError('');
    if (!tableNumber.trim()) { setFormError('테이블 번호를 입력하세요.'); return; }
    if (tableNumber.length > 20) { setFormError('테이블 번호는 20자 이내입니다.'); return; }
    if (password.length < 8) { setFormError('비밀번호는 8자 이상이어야 합니다.'); return; }
    try {
      await addTable({ tableNumber: tableNumber.trim(), password });
      setShowForm(false);
      setTableNumber('');
      setPassword('');
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 409) {
        setFormError('이미 등록된 테이블 번호입니다.');
      } else {
        setFormError('테이블 등록에 실패했습니다.');
      }
    }
  };

  const loadHistory = async (tableId: number, page = 0) => {
    try {
      const data = await fetchHistory(tableId, { startDate: startDate || undefined, endDate: endDate || undefined, page, size: 10 });
      setHistoryData(data);
      setHistoryPage(page);
    } catch {
      showToast('error', '과거 내역을 불러오지 못했습니다.');
    }
  };

  const openHistory = (tableId: number) => {
    setHistoryTableId(tableId);
    setStartDate('');
    setEndDate('');
    loadHistory(tableId, 0);
  };

  if (loading) return <LoadingSpinner message="테이블 목록 로딩 중..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchTables} />;

  return (
    <div>
      <div className={styles.topBar}>
        <h2 className={styles.heading}>테이블 관리</h2>
        {isManager && (
          <button className={styles.addBtn} onClick={() => setShowForm(true)} type="button">
            + 테이블 등록
          </button>
        )}
      </div>

      {/* 테이블 등록 폼 */}
      {showForm && (
        <div className={styles.formCard}>
          <h3>새 테이블 등록</h3>
          {formError && <p className={styles.formError}>{formError}</p>}
          <label className={styles.label}>
            테이블 번호
            <input className={styles.input} value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} maxLength={20} />
          </label>
          <label className={styles.label}>
            비밀번호
            <input className={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setFormError(''); }} type="button">취소</button>
            <button className={styles.submitBtn} onClick={handleCreateTable} type="button">등록</button>
          </div>
        </div>
      )}

      {/* 테이블 목록 */}
      <div className={styles.tableList}>
        {tables.map((t) => (
          <div key={t.id} className={styles.tableCard}>
            <div className={styles.cardHeader}>
              <span className={styles.tableNum}>{t.tableNumber}</span>
              <span className={t.currentSession ? styles.activeBadge : styles.inactiveBadge}>
                {t.currentSession ? '이용중' : '비어있음'}
              </span>
            </div>
            {t.currentSession && (
              <div className={styles.sessionInfo}>
                주문 {t.currentSession.orderCount}건 · {formatPrice(t.currentSession.totalOrderAmount)}
              </div>
            )}
            <div className={styles.cardActions}>
              {t.currentSession && (
                <button className={styles.completeBtn} onClick={() => setCompleteTarget(t.id)} type="button">
                  이용 완료
                </button>
              )}
              <button className={styles.historyBtn} onClick={() => openHistory(t.id)} type="button">
                과거 내역
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 이용 완료 확인 */}
      <ConfirmDialog
        isOpen={completeTarget !== null}
        title="이용 완료"
        message="이 테이블의 이용을 완료하시겠습니까? 현재 주문이 이력으로 이동됩니다."
        confirmLabel="완료 처리"
        onConfirm={() => { if (completeTarget) { completeTableSession(completeTarget); setCompleteTarget(null); } }}
        onCancel={() => setCompleteTarget(null)}
      />

      {/* 과거 내역 모달 */}
      {historyTableId !== null && (
        <div className={styles.modalOverlay} onClick={() => setHistoryTableId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>과거 주문 내역</h3>
              <button className={styles.closeBtn} onClick={() => setHistoryTableId(null)} type="button">✕</button>
            </div>
            <div className={styles.dateFilter}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span>~</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <button className={styles.searchBtn} onClick={() => loadHistory(historyTableId, 0)} type="button">조회</button>
            </div>
            {historyData && historyData.content.length > 0 ? (
              <>
                {historyData.content.map((h) => (
                  <div key={h.id} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <span>{h.orderNumber}</span>
                      <span>{formatPrice(h.totalAmount)}</span>
                    </div>
                    <div className={styles.historyTime}>{formatDateTime(h.orderedAt)}</div>
                    <ul className={styles.historyItems}>
                      {h.orderItems.map((item, idx) => (
                        <li key={idx}>{item.menuName} × {item.quantity} ({formatPrice(item.subtotal)})</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Pagination page={historyPage} totalPages={historyData.totalPages} onPageChange={(p) => loadHistory(historyTableId, p)} />
              </>
            ) : (
              <p className={styles.empty}>과거 내역이 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
