import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AxiosError } from 'axios';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [storeCode, setStoreCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!storeCode.trim() || !username.trim() || !password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await login({ storeCode: storeCode.trim(), username: username.trim(), password });
      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const data = err.response?.data;
        const code = data?.error?.code ?? data?.errorCode ?? '';

        if (code === 'ACCOUNT_LOCKED') {
          setError('계정이 잠겼습니다. 15분 후 다시 시도해주세요.');
        } else if (status === 401) {
          setError('매장 코드, 사용자명 또는 비밀번호가 올바르지 않습니다.');
        } else {
          setError('로그인에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        setError('네트워크 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>테이블오더 관리자</h1>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <label className={styles.label}>
          매장 코드
          <input
            className={styles.input}
            type="text"
            value={storeCode}
            onChange={(e) => setStoreCode(e.target.value)}
            placeholder="매장 코드를 입력하세요"
            maxLength={50}
            autoFocus
            required
          />
        </label>

        <label className={styles.label}>
          사용자명
          <input
            className={styles.input}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="사용자명을 입력하세요"
            maxLength={50}
            required
          />
        </label>

        <label className={styles.label}>
          비밀번호
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </label>

        <button className={styles.submitBtn} type="submit" disabled={loading}>
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}
