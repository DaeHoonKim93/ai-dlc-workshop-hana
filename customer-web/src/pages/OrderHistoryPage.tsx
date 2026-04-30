import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner, ErrorMessage, OrderStatusBadge } from '@/components';
import { formatPrice, formatDateTime } from '@/utils/format';
import styles from './OrderHistoryPage.module.css';

export default function OrderHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orders, loading, error, hasMore, fetchOrders, loadMore } = useOrders();
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchOrders(0);
  }, [fetchOrders]);

  // 무한 스크롤
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (entry?.isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    [hasMore, loading, loadMore],
  );

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} type="button">
          ← {t('common.back')}
        </button>
        <h1 className={styles.title}>{t('orderHistory.title')}</h1>
        <div style={{ width: 60 }} />
      </header>

      <main className={styles.content}>
        {error && <ErrorMessage message={error} onRetry={() => fetchOrders(0)} />}

        {!error && orders.length === 0 && !loading && (
          <p className={styles.emptyText}>{t('orderHistory.empty')}</p>
        )}

        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <span className={styles.orderNumber}>{order.orderNumber}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className={styles.orderTime}>{formatDateTime(order.createdAt)}</p>
            <ul className={styles.orderItems}>
              {order.items.map((item) => (
                <li key={item.id} className={styles.orderItem}>
                  {item.menuName} x{item.quantity}
                </li>
              ))}
            </ul>
            <p className={styles.orderTotal}>{formatPrice(order.totalAmount)}</p>
          </div>
        ))}

        {loading && <LoadingSpinner size="sm" />}
        <div ref={observerRef} style={{ height: 1 }} />
      </main>
    </div>
  );
}
