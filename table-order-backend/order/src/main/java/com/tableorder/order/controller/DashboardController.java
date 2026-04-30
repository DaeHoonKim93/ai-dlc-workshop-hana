package com.tableorder.order.controller;

import com.tableorder.common.dto.ApiResponse;
import com.tableorder.order.dto.OrderResponse;
import com.tableorder.order.entity.Order;
import com.tableorder.order.repository.OrderRepository;
import com.tableorder.table.entity.StoreTable;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.repository.TableRepository;
import com.tableorder.table.repository.TableSessionRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stores/{storeId}/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TableRepository tableRepository;
    private final TableSessionRepository tableSessionRepository;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@PathVariable Long storeId) {
        List<StoreTable> tables = tableRepository.findByStoreIdOrderByTableNumber(storeId);

        List<DashboardResponse.TableDashboardData> tableDataList = tables.stream()
                .map(table -> {
                    Optional<TableSession> session = tableSessionRepository.findByTableIdAndIsActiveTrue(table.getId());
                    boolean hasActiveSession = session.isPresent();
                    int totalAmount = 0;
                    int orderCount = 0;
                    List<DashboardResponse.LatestOrder> latestOrders = Collections.emptyList();

                    if (hasActiveSession) {
                        List<Order> orders = orderRepository.findByTableIdAndSessionIdOrderByCreatedAtDesc(
                                table.getId(), session.get().getId());
                        totalAmount = orders.stream().mapToInt(Order::getTotalAmount).sum();
                        orderCount = orders.size();
                        latestOrders = orders.stream()
                                .limit(3)
                                .map(o -> DashboardResponse.LatestOrder.builder()
                                        .id(o.getId())
                                        .orderNumber(o.getOrderNumber())
                                        .status(o.getStatus().name())
                                        .totalAmount(o.getTotalAmount())
                                        .itemSummary(buildItemSummary(o))
                                        .createdAt(o.getCreatedAt().toString())
                                        .build())
                                .collect(Collectors.toList());
                    }

                    return DashboardResponse.TableDashboardData.builder()
                            .tableId(table.getId())
                            .tableNumber(table.getTableNumber())
                            .hasActiveSession(hasActiveSession)
                            .totalOrderAmount(totalAmount)
                            .orderCount(orderCount)
                            .latestOrders(latestOrders)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(new DashboardResponse(tableDataList)));
    }

    private String buildItemSummary(Order order) {
        return order.getOrderItems().stream()
                .map(item -> item.getMenuName() + " x" + item.getQuantity())
                .collect(Collectors.joining(", "));
    }

    @Getter
    @AllArgsConstructor
    public static class DashboardResponse {
        private List<TableDashboardData> tables;

        @Getter
        @Builder
        @AllArgsConstructor
        public static class TableDashboardData {
            private Long tableId;
            private String tableNumber;
            private boolean hasActiveSession;
            private int totalOrderAmount;
            private int orderCount;
            private List<LatestOrder> latestOrders;
        }

        @Getter
        @Builder
        @AllArgsConstructor
        public static class LatestOrder {
            private Long id;
            private String orderNumber;
            private String status;
            private int totalAmount;
            private String itemSummary;
            private String createdAt;
        }
    }
}
