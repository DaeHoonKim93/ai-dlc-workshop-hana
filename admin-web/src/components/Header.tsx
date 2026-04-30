import { useAuth } from '@/hooks/useAuth';
import styles from './Header.module.css';

export default function Header() {
  const { auth, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.info}>
        <span className={styles.role}>
          {auth.role === 'MANAGER' ? '매니저' : '스태프'}
        </span>
      </div>
      <button className={styles.logoutBtn} onClick={logout} type="button">
        로그아웃
      </button>
    </header>
  );
}
