package com.tableorder.order.event;

import com.tableorder.order.dto.OrderResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderCreatedEvent {
    private final Long storeId;
    private final OrderResponse orderResponse;
}
