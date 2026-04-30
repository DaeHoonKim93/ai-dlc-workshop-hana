package com.tableorder.menu.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MenuOrderRequest {

    @NotEmpty(message = "메뉴 순서 목록이 비어있습니다")
    @Valid
    private List<MenuOrderItem> menuOrders;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuOrderItem {
        @NotNull(message = "메뉴 ID는 필수입니다")
        private Long menuId;

        @NotNull(message = "순서는 필수입니다")
        @Min(value = 0, message = "순서는 0 이상이어야 합니다")
        private Integer displayOrder;
    }
}
