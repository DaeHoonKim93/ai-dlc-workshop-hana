package com.tableorder.order.event;

import com.tableorder.order.service.SseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventHandler {

    private final SseService sseService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.debug("SSE: NEW_ORDER event for storeId={}", event.getStoreId());
        sseService.notify(event.getStoreId(), "NEW_ORDER", event.getOrderResponse());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderStatusChanged(OrderStatusChangedEvent event) {
        log.debug("SSE: ORDER_STATUS_CHANGED event for storeId={}", event.getStoreId());
        sseService.notify(event.getStoreId(), "ORDER_STATUS_CHANGED", Map.of(
                "id", event.getOrderResponse().getId(),
                "orderNumber", event.getOrderResponse().getOrderNumber(),
                "tableId", event.getOrderResponse().getTableId(),
                "tableNumber", event.getOrderResponse().getTableNumber(),
                "status", event.getOrderResponse().getStatus(),
                "previousStatus", event.getPreviousStatus(),
                "updatedAt", LocalDateTime.now().toString()
        ));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderDeleted(OrderDeletedEvent event) {
        log.debug("SSE: ORDER_DELETED event for storeId={}", event.getStoreId());
        sseService.notify(event.getStoreId(), "ORDER_DELETED", Map.of(
                "orderId", event.getOrderId(),
                "tableId", event.getTableId(),
                "tableNumber", event.getTableNumber(),
                "deletedAt", LocalDateTime.now().toString()
        ));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleTableReset(TableResetEvent event) {
        log.debug("SSE: TABLE_RESET event for storeId={}", event.getStoreId());
        sseService.notify(event.getStoreId(), "TABLE_RESET", Map.of(
                "tableId", event.getTableId(),
                "tableNumber", event.getTableNumber(),
                "completedAt", event.getCompletedAt().toString()
        ));
    }
}
