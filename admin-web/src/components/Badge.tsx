import styles from './Badge.module.css';

type BadgeVariant = 'pending' | 'accepted' | 'preparing' | 'completed' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  COMPLETED: 'completed',
};

export function statusToVariant(status: string): BadgeVariant {
  return STATUS_VARIANT_MAP[status] ?? 'default';
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>
  );
}
