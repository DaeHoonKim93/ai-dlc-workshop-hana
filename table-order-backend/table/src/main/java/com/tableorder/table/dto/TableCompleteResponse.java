package com.tableorder.table.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class TableCompleteResponse {

    private Long tableId;
    private String tableNumber;
    private Long completedSessionId;
    private Integer archivedOrderCount;
    private Integer archivedTotalAmount;
    private LocalDateTime completedAt;
}
