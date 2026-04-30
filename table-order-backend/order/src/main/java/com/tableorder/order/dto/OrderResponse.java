package com.tableorder.order.dto;

import com.tableorder.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private Long tableId;
    private String tableNumber;
    private Long sessionId;
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private Integer totalAmount;
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long menuItemId;
        private String menuName;
        private Integer quantity;
        private Integer unitPrice;
        private Integer subtotal;
    }
}
