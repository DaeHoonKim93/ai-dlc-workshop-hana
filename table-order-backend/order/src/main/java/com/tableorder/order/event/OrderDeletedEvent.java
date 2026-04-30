package com.tableorder.order.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrderDeletedEvent {
    private final Long storeId;
    private final Long orderId;
    private final Long tableId;
    private final String tableNumber;
}
