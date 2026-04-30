export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'COMPLETED';

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  tableId: number;
  tableNumber: string;
  sessionId: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStatusUpdateRequest {
  status: 'ACCEPTED' | 'PREPARING' | 'COMPLETED';
}

export interface OrderHistoryItem {
  menuName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderHistory {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  orderItems: OrderHistoryItem[];
  orderedAt: string;
  completedAt: string;
}
