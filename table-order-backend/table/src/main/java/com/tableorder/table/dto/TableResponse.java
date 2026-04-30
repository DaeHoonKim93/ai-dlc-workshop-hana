package com.tableorder.table.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class TableResponse {

    private Long id;
    private String tableNumber;
    private Boolean isActive;
    private SessionInfo currentSession;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class SessionInfo {
        private Long sessionId;
        private LocalDateTime startedAt;
        private Integer totalOrderAmount;
        private Integer orderCount;
    }
}
