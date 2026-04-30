import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { LoadingSpinner, ErrorMessage } from '@/components';
import { formatPrice } from '@/utils/format';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { tables, highlightedTableIds, loading, error, isConnected, refresh } =
    useDashboard({ storeId: auth.storeId });

  const [filter, setFilter] = useState('');

  const filteredTables = useMemo(() => {
    if (!filter.trim()) return tables;
    const keyword = filter.trim().toLowerCase();
    return tables.filter((t) =>
      t.tableNumber.toLowerCase().includes(keyword),
    );
  }, [tables, filter]);

  if (loading) return <LoadingSpinner message="대시보드 로딩 중..." />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  return (
    <div>
      <div className={styles.topBar}>
        <h2 className={styles.heading}>실시간 주문 대시보드</h2>
        <div className={styles.controls}>
          <span className={`${styles.sseStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
            {isConnected ? '● 연결됨' : '○ 연결 끊김'}
          </span>
          <input
            className={styles.filterInput}
            type="text"
            placeholder="테이블 번호 검색"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="테이블 번호 필터"
          />
        </div>
      </div>

      {filteredTables.length === 0 ? (
        <p className={styles.empty}>등록된 테이블이 없습니다.</p>
      ) : (
        <div className={styles.grid}>
          {filteredTables.map((table) => (
            <button
              key={table.tableId}
              className={`${styles.card} ${highlightedTableIds.has(table.tableId) ? styles.highlight : ''} ${table.hasActiveSession ? styles.active : styles.inactive}`}
              onClick={() => navigate(`/tables/${table.tableId}/orders`)}
              type="button"
            >
              <div className={styles.cardHeader}>
                <span className={styles.tableNumber}>{table.tableNumber}</span>
                {table.hasActiveSession && (
                  <span className={styles.sessionBadge}>이용중</span>
                )}
              </div>
              {table.hasActiveSession && (
                <>
                  <div className={styles.cardAmount}>
                    {formatPrice(table.totalOrderAmount)}
                  </div>
                  <div className={styles.cardOrders}>
                    주문 {table.orderCount}건
                  </div>
                  <ul className={styles.previewList}>
                    {table.latestOrders.slice(0, 3).map((order) => (
                      <li key={order.id} className={styles.previewItem}>
                        <span className={styles.previewSummary}>
                          {order.itemSummary}
                        </span>
                        <span className={styles.previewAmount}>
                          {formatPrice(order.totalAmount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!table.hasActiveSession && (
                <div className={styles.emptySession}>비어있음</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
