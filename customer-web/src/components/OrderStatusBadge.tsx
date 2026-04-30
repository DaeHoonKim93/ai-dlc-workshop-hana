import { useTranslation } from 'react-i18next';
import type { OrderStatus } from '@/types/order';
import styles from './OrderStatusBadge.module.css';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusStyleMap: Record<OrderStatus, string> = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  COMPLETED: 'completed',
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <span className={`${styles.badge} ${styles[statusStyleMap[status]]}`}>
      {t(`orderHistory.status.${status}`)}
    </span>
  );
}
