import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner, ErrorMessage } from '@/components';
import { formatPrice } from '@/utils/format';
import styles from './OrderConfirmPage.module.css';

export default function OrderConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { submitting, error, createOrder } = useOrders();

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>{t('order.emptyCart')}</p>
        <button className={styles.goMenuBtn} onClick={() => navigate('/')} type="button">
          {t('cart.goToMenu')}
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    try {
      const order = await createOrder(
        cartItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      );
      clearCart();
      navigate('/order/success', { state: { orderNumber: order.orderNumber }, replace: true });
    } catch {
      // error는 useOrders에서 관리
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/cart')} type="button">
          ← {t('common.back')}
        </button>
        <h1 className={styles.title}>{t('order.confirmTitle')}</h1>
        <div style={{ width: 60 }} />
      </header>

      <div className={styles.tableInfo}>
        {t('order.table')}: {auth.tableId}
      </div>

      <ul className={styles.itemList}>
        {cartItems.map((item) => (
          <li key={item.menuItemId} className={styles.item}>
            <span className={styles.itemName}>{item.menuName}</span>
            <span className={styles.itemQty}>x{item.quantity}</span>
            <span className={styles.itemSubtotal}>{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className={styles.totalRow}>
        <span>{t('cart.total')}</span>
        <span className={styles.totalAmount}>{formatPrice(totalAmount)}</span>
      </div>

      {error && <ErrorMessage message={error} />}

      <footer className={styles.footer}>
        <button
          className={styles.placeOrderBtn}
          onClick={handlePlaceOrder}
          disabled={submitting}
          type="button"
        >
          {submitting ? <LoadingSpinner size="sm" /> : t('order.placeOrder')}
        </button>
      </footer>
    </div>
  );
}
