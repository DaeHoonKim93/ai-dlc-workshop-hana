package com.tableorder.order.event;

import com.tableorder.order.dto.OrderResponse;
import com.tableorder.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderStatusChangedEvent {
    private final Long storeId;
    private final OrderResponse orderResponse;
    private final OrderStatus previousStatus;
}
