import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ORDER_SUCCESS_REDIRECT_SECONDS } from '@/utils/constants';
import styles from './OrderSuccessPage.module.css';

export default function OrderSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const orderNumber = (location.state as { orderNumber?: string })?.orderNumber;
  const [countdown, setCountdown] = useState(ORDER_SUCCESS_REDIRECT_SECONDS);

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/', { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✅</div>
        <h1 className={styles.title}>{t('order.successTitle')}</h1>
        {orderNumber && (
          <p className={styles.orderNumber}>
            {t('order.orderNumber')}: {orderNumber}
          </p>
        )}
        <p className={styles.countdown}>
          {t('order.redirecting', { seconds: countdown })}
        </p>
        <button
          className={styles.goMenuBtn}
          onClick={() => navigate('/', { replace: true })}
          type="button"
        >
          {t('cart.goToMenu')}
        </button>
      </div>
    </div>
  );
}
