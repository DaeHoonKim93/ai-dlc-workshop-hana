/** 금액 포맷 (예: 9000 → "9,000원") */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ko-KR')}원`;
}

/** 날짜 포맷 (예: "2025-01-01T14:30:22" → "2025.01.01 14:30") */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${min}`;
}

/** 주문 상태 한글 변환 */
export function orderStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: '대기중',
    ACCEPTED: '접수',
    PREPARING: '준비중',
    COMPLETED: '완료',
  };
  return map[status] ?? status;
}
