import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/useCart';
import { ConfirmDialog } from '@/components';
import { formatPrice } from '@/utils/format';
import styles from './CartPage.module.css';

export default function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, totalAmount, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (cartItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>{t('cart.empty')}</p>
        <button className={styles.goMenuBtn} onClick={() => navigate('/')} type="button">
          {t('cart.goToMenu')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')} type="button" aria-label={t('common.back')}>
          ← {t('common.back')}
        </button>
        <h1 className={styles.title}>{t('cart.title')}</h1>
        <button className={styles.clearBtn} onClick={() => setShowClearConfirm(true)} type="button">
          {t('cart.clearAll')}
        </button>
      </header>

      <ul className={styles.itemList}>
        {cartItems.map((item) => (
          <li key={item.menuItemId} className={styles.item}>
            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{item.menuName}</p>
              <p className={styles.itemPrice}>{formatPrice(item.price)}</p>
            </div>
            <div className={styles.quantityControl}>
              <button
                className={styles.qtyBtn}
                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                type="button"
                aria-label="수량 감소"
              >
                −
              </button>
              <span className={styles.qtyValue}>{item.quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                type="button"
                aria-label="수량 증가"
              >
                +
              </button>
            </div>
            <p className={styles.subtotal}>{formatPrice(item.price * item.quantity)}</p>
            <button
              className={styles.removeBtn}
              onClick={() => removeItem(item.menuItemId)}
              type="button"
              aria-label={`${item.menuName} 삭제`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <footer className={styles.footer}>
        <div className={styles.totalRow}>
          <span>{t('cart.total')} ({t('cart.itemCount', { count: itemCount })})</span>
          <span className={styles.totalAmount}>{formatPrice(totalAmount)}</span>
        </div>
        <button className={styles.orderBtn} onClick={() => navigate('/order/confirm')} type="button">
          {t('cart.order')}
        </button>
      </footer>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title={t('cart.clearConfirmTitle')}
        message={t('cart.clearConfirmMessage')}
        confirmLabel={t('common.confirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => { clearCart(); setShowClearConfirm(false); }}
        onCancel={() => setShowClearConfirm(false)}
        variant="danger"
      />
    </div>
  );
}
