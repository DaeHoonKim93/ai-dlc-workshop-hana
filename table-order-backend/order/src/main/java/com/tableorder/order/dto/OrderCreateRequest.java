package com.tableorder.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    @NotNull(message = "테이블 ID는 필수입니다")
    private Long tableId;

    @NotEmpty(message = "주문 항목이 비어있습니다")
    @Valid
    private List<OrderItemRequest> items;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "메뉴 ID는 필수입니다")
        private Long menuItemId;

        @NotNull(message = "수량은 필수입니다")
        @Min(value = 1, message = "수량은 1 이상이어야 합니다")
        @Max(value = 99, message = "수량은 99 이하여야 합니다")
        private Integer quantity;
    }
}
