import { useTranslation } from 'react-i18next';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.container} role="alert">
      <p className={styles.message}>⚠️ {message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry} type="button">
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
