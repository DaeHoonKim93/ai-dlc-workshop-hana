package com.tableorder.order.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.menu.entity.MenuItem;
import com.tableorder.menu.repository.MenuItemRepository;
import com.tableorder.order.dto.*;
import com.tableorder.order.entity.Order;
import com.tableorder.order.entity.OrderItem;
import com.tableorder.order.entity.OrderStatus;
import com.tableorder.order.event.OrderCreatedEvent;
import com.tableorder.order.event.OrderDeletedEvent;
import com.tableorder.order.event.OrderStatusChangedEvent;
import com.tableorder.order.repository.OrderRepository;
import com.tableorder.table.entity.StoreTable;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.repository.TableRepository;
import com.tableorder.table.service.TableSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final TableSessionService tableSessionService;
    private final ApplicationEventPublisher eventPublisher;

    private static final Random RANDOM = new Random();
    private static final String ORDER_NUMBER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    @Transactional
    public OrderResponse createOrder(Long storeId, OrderCreateRequest request) {
        StoreTable table = tableRepository.findById(request.getTableId())
                .orElseThrow(() -> BusinessException.notFound("테이블을 찾을 수 없습니다"));

        if (!table.getStoreId().equals(storeId)) {
            throw BusinessException.forbidden("접근 권한이 없습니다");
        }

        TableSession session = tableSessionService.getOrCreateSession(table.getId(), storeId);

        Order order = Order.builder()
                .storeId(storeId)
                .tableId(table.getId())
                .sessionId(session.getId())
                .orderNumber(generateOrderNumber())
                .status(OrderStatus.PENDING)
                .totalAmount(0)
                .build();

        int totalAmount = 0;
        for (OrderCreateRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findByIdAndStoreId(itemReq.getMenuItemId(), storeId)
                    .orElseThrow(() -> BusinessException.notFound("메뉴를 찾을 수 없습니다: " + itemReq.getMenuItemId()));

            if (!menuItem.getIsAvailable()) {
                throw BusinessException.badRequest("판매 중지된 메뉴가 포함되어 있습니다: " + menuItem.getName());
            }

            int subtotal = menuItem.getPrice() * itemReq.getQuantity();
            totalAmount += subtotal;

            OrderItem orderItem = OrderItem.builder()
                    .menuItemId(menuItem.getId())
                    .menuName(menuItem.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(menuItem.getPrice())
                    .subtotal(subtotal)
                    .build();

            order.addOrderItem(orderItem);
        }

        order.setTotalAmount(totalAmount);
        Order saved = orderRepository.save(order);

        OrderResponse response = toOrderResponse(saved, table.getTableNumber());
        eventPublisher.publishEvent(new OrderCreatedEvent(storeId, response));

        log.info("Order created: storeId={}, tableId={}, orderNumber={}, totalAmount={}",
                storeId, table.getId(), saved.getOrderNumber(), totalAmount);

        return response;
    }

    public Page<OrderResponse> getOrders(Long storeId, OrderStatus status, Pageable pageable) {
        Page<Order> orders;
        if (status != null) {
            orders = orderRepository.findByStoreIdAndStatusOrderByCreatedAtDesc(storeId, status, pageable);
        } else {
            orders = orderRepository.findByStoreIdOrderByCreatedAtDesc(storeId, pageable);
        }
        return orders.map(o -> {
            StoreTable table = tableRepository.findById(o.getTableId()).orElse(null);
            String tableNumber = table != null ? table.getTableNumber() : "Unknown";
            return toOrderResponse(o, tableNumber);
        });
    }

    public List<OrderResponse> getOrdersByTableSession(Long tableId, Long sessionId) {
        List<Order> orders = orderRepository.findByTableIdAndSessionIdOrderByCreatedAtDesc(tableId, sessionId);
        StoreTable table = tableRepository.findById(tableId).orElse(null);
        String tableNumber = table != null ? table.getTableNumber() : "Unknown";
        return orders.stream().map(o -> toOrderResponse(o, tableNumber)).collect(Collectors.toList());
    }

    public OrderResponse getOrder(Long storeId, Long orderId) {
        Order order = orderRepository.findByIdAndStoreIdWithItems(orderId, storeId)
                .orElseThrow(() -> BusinessException.notFound("주문을 찾을 수 없습니다"));
        StoreTable table = tableRepository.findById(order.getTableId()).orElse(null);
        String tableNumber = table != null ? table.getTableNumber() : "Unknown";
        return toOrderResponse(order, tableNumber);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long storeId, Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findByIdAndStoreIdWithItems(orderId, storeId)
                .orElseThrow(() -> BusinessException.notFound("주문을 찾을 수 없습니다"));

        OrderStatus previousStatus = order.getStatus();
        if (!previousStatus.canTransitionTo(newStatus)) {
            throw BusinessException.badRequest(
                    String.format("유효하지 않은 상태 변경입니다 (%s → %s)", previousStatus, newStatus));
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        StoreTable table = tableRepository.findById(order.getTableId()).orElse(null);
        String tableNumber = table != null ? table.getTableNumber() : "Unknown";
        OrderResponse response = toOrderResponse(order, tableNumber);

        eventPublisher.publishEvent(new OrderStatusChangedEvent(storeId, response, previousStatus));

        log.info("Order status changed: orderId={}, {} -> {}", orderId, previousStatus, newStatus);
        return response;
    }

    @Transactional
    public void deleteOrder(Long storeId, Long orderId) {
        Order order = orderRepository.findByIdAndStoreIdWithItems(orderId, storeId)
                .orElseThrow(() -> BusinessException.notFound("주문을 찾을 수 없습니다"));

        StoreTable table = tableRepository.findById(order.getTableId()).orElse(null);
        String tableNumber = table != null ? table.getTableNumber() : "Unknown";

        orderRepository.delete(order);

        eventPublisher.publishEvent(new OrderDeletedEvent(storeId, orderId, order.getTableId(), tableNumber));

        log.info("Order deleted: storeId={}, orderId={}", storeId, orderId);
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        StringBuilder random = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            random.append(ORDER_NUMBER_CHARS.charAt(RANDOM.nextInt(ORDER_NUMBER_CHARS.length())));
        }
        return timestamp + "-" + random;
    }

    private OrderResponse toOrderResponse(Order order, String tableNumber) {
        List<OrderResponse.OrderItemResponse> items = order.getOrderItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .menuItemId(item.getMenuItemId())
                        .menuName(item.getMenuName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .tableId(order.getTableId())
                .tableNumber(tableNumber)
                .sessionId(order.getSessionId())
                .status(order.getStatus())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
