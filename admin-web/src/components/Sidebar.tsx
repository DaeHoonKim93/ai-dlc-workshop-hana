import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  managerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/tables', label: '테이블 관리', icon: '🪑' },
  { to: '/menus', label: '메뉴 관리', icon: '🍽️', managerOnly: true },
  { to: '/staff', label: '직원 관리', icon: '👤', managerOnly: true },
];

export default function Sidebar() {
  const { isManager } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.managerOnly || isManager,
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>테이블오더</div>
      <nav className={styles.nav}>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
