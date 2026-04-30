import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className={styles.container} aria-label="페이지 네비게이션">
      <button
        className={styles.btn}
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        type="button"
        aria-label="이전 페이지"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`${styles.btn} ${p === page ? styles.active : ''}`}
          onClick={() => onPageChange(p)}
          type="button"
          aria-current={p === page ? 'page' : undefined}
        >
          {p + 1}
        </button>
      ))}
      <button
        className={styles.btn}
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        type="button"
        aria-label="다음 페이지"
      >
        ›
      </button>
    </nav>
  );
}
