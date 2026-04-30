export interface SSEOrderDeletedEvent {
  orderId: number;
  tableId: number;
  tableNumber: string;
  deletedAt: string;
}

export interface SSETableResetEvent {
  tableId: number;
  tableNumber: string;
  completedAt: string;
}

export interface SSEHeartbeatEvent {
  timestamp: string;
}
