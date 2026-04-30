import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className={styles.container} role="alert">
      <p className={styles.message}>⚠️ {message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry} type="button">
          다시 시도
        </button>
      )}
    </div>
  );
}
