/** 장바구니 아이템 (클라이언트 전용 - 서버 API 없음) */
export interface CartItem {
  menuItemId: number;
  menuName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
}
