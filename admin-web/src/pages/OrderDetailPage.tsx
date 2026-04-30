import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { LoadingSpinner, ErrorMessage, Badge, ConfirmDialog } from '@/components';
import { statusToVariant } from '@/components/Badge';
import { formatPrice, formatDateTime, orderStatusLabel } from '@/utils/format';
import type { OrderStatus } from '@/types/order';
import styles from './OrderDetailPage.module.css';

const NEXT_STATUS: Record<string, OrderStatus | null> = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'PREPARING',
  PREPARING: 'COMPLETED',
  COMPLETED: null,
};

const NEXT_LABEL: Record<string, string> = {
  PENDING: '접수',
  ACCEPTED: '준비중으로 변경',
  PREPARING: '완료 처리',
};

export default function OrderDetailPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { orders, loading, error, fetchOrders, changeStatus, removeOrder } =
    useOrderManagement(auth.storeId);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    if (tableId) fetchOrders(Number(tableId));
  }, [tableId, fetchOrders]);

  if (loading) return <LoadingSpinner message="주문 목록 로딩 중..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchOrders(Number(tableId))} />;

  return (
    <div>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')} type="button">
          ← 대시보드
        </button>
        <h2 className={styles.heading}>
          테이블 {orders[0]?.tableNumber ?? tableId} 주문 목록
        </h2>
      </div>

      {orders.length === 0 ? (
        <p className={styles.empty}>주문이 없습니다.</p>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => {
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.orderNumber}>{order.orderNumber}</span>
                  <Badge
                    label={orderStatusLabel(order.status)}
                    variant={statusToVariant(order.status)}
                  />
                </div>
                <div className={styles.cardTime}>
                  {formatDateTime(order.createdAt)}
                </div>
                <ul className={styles.itemList}>
                  {order.items.map((item) => (
                    <li key={item.id} className={styles.item}>
                      <span>{item.menuName} × {item.quantity}</span>
                      <span>{formatPrice(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.cardTotal}>
                  합계: {formatPrice(order.totalAmount)}
                </div>
                <div className={styles.cardActions}>
                  {nextStatus && (
                    <button
                      className={styles.statusBtn}
                      onClick={() => changeStatus(order.id, nextStatus)}
                      type="button"
                    >
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeleteTarget(order.id)}
                    type="button"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="주문 삭제"
        message="이 주문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmLabel="삭제"
        variant="danger"
        onConfirm={() => {
          if (deleteTarget !== null) {
            removeOrder(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
