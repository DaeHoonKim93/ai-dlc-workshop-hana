import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { validateLoginForm } from '@/utils/validation';
import type { ValidationError } from '@/utils/validation';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [storeCode, setStoreCode] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFieldError = (field: string) =>
    errors.find((e) => e.field === field)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validateLoginForm(storeCode, tableNumber, password);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);

    setLoading(true);
    try {
      await login({ storeCode, tableNumber, password });
      navigate('/', { replace: true });
    } catch (err) {
      const message = extractLoginError(err, t);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('login.title')}</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="storeCode" className={styles.label}>
              {t('login.storeCode')}
            </label>
            <input
              id="storeCode"
              type="text"
              className={styles.input}
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
              maxLength={50}
              autoComplete="off"
            />
            {getFieldError('storeCode') && (
              <p className={styles.fieldError}>{getFieldError('storeCode')}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="tableNumber" className={styles.label}>
              {t('login.tableNumber')}
            </label>
            <input
              id="tableNumber"
              type="text"
              className={styles.input}
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              maxLength={20}
              autoComplete="off"
            />
            {getFieldError('tableNumber') && (
              <p className={styles.fieldError}>{getFieldError('tableNumber')}</p>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              {t('login.password')}
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {getFieldError('password') && (
              <p className={styles.fieldError}>{getFieldError('password')}</p>
            )}
          </div>

          {apiError && <p className={styles.apiError}>{apiError}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '...' : t('login.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

function extractLoginError(err: unknown, t: (key: string) => string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: { data?: { error?: { code?: string; message?: string }; errorCode?: string; message?: string } } }).response;
    const code = response?.data?.error?.code || response?.data?.errorCode;
    if (code === 'ACCOUNT_LOCKED') return t('login.accountLocked');
    if (code === 'AUTHENTICATION_FAILED') return t('login.authFailed');
    return response?.data?.message || response?.data?.error?.message || t('login.authFailed');
  }
  return t('common.networkError');
}
