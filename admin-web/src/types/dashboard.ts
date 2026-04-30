export interface LatestOrder {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemSummary: string;
  createdAt: string;
}

export interface TableDashboardData {
  tableId: number;
  tableNumber: string;
  hasActiveSession: boolean;
  totalOrderAmount: number;
  orderCount: number;
  latestOrders: LatestOrder[];
}

export interface DashboardData {
  tables: TableDashboardData[];
}

/** SSE 이벤트 타입 */
export type SSEEventType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_DELETED'
  | 'TABLE_RESET'
  | 'HEARTBEAT';

export interface SSENewOrderEvent {
  id: number;
  orderNumber: string;
  tableId: number;
  tableNumber: string;
  sessionId: number;
  status: string;
  items: {
    id: number;
    menuItemId: number;
    menuName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  totalAmount: number;
  createdAt: string;
}

export interface SSEOrderStatusChangedEvent {
  id: number;
  orderNumber: string;
  tableId: number;
  tableNumber: string;
  status: string;
  previousStatus: string;
  updatedAt: string;
}
