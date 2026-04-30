export interface TableSession {
  sessionId: number;
  startedAt: string;
  totalOrderAmount: number;
  orderCount: number;
}

export interface Table {
  id: number;
  tableNumber: string;
  isActive: boolean;
  currentSession: TableSession | null;
  createdAt: string;
}

export interface TableCreateRequest {
  tableNumber: string;
  password: string;
}

export interface TableCreateResponse {
  id: number;
  tableNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface TableCompleteResponse {
  tableId: number;
  tableNumber: string;
  completedSessionId: number;
  archivedOrderCount: number;
  archivedTotalAmount: number;
  completedAt: string;
}
