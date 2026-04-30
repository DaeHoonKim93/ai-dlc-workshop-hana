import { useEffect, useRef, useState, useCallback } from 'react';
import { getAccessToken } from '@/api/client';
import type { SSEEventType } from '@/types/dashboard';

interface UseSSEOptions {
  storeId: number | null;
  onEvent: (eventType: SSEEventType, data: unknown) => void;
}

export function useSSE({ storeId, onEvent }: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (!storeId) return;

    const token = getAccessToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const url = `${baseUrl}/stores/${storeId}/orders/subscribe?token=${token}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setIsConnected(true);

    const eventTypes: SSEEventType[] = [
      'NEW_ORDER',
      'ORDER_STATUS_CHANGED',
      'ORDER_DELETED',
      'TABLE_RESET',
      'HEARTBEAT',
    ];

    eventTypes.forEach((type) => {
      es.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          onEventRef.current(type, data);
        } catch {
          // JSON 파싱 실패 무시
        }
      });
    });

    es.onerror = () => {
      setIsConnected(false);
      es.close();
      reconnectTimerRef.current = setTimeout(connect, 3000);
    };
  }, [storeId]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  return { isConnected, reconnect: connect };
}
