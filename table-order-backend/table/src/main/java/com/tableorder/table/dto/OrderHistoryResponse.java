package com.tableorder.table.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class OrderHistoryResponse {

    private Long id;
    private String orderNumber;
    private Integer totalAmount;
    private String status;
    private List<OrderHistoryItemResponse> orderItems;
    private LocalDateTime orderedAt;
    private LocalDateTime completedAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class OrderHistoryItemResponse {
        private String menuName;
        private Integer quantity;
        private Integer unitPrice;
        private Integer subtotal;
    }
}
