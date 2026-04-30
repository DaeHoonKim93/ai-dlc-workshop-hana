package com.tableorder.order.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class TableResetEvent {
    private final Long storeId;
    private final Long tableId;
    private final String tableNumber;
    private final LocalDateTime completedAt;
}
