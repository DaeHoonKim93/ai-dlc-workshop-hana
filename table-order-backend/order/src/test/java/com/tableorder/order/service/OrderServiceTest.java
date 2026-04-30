package com.tableorder.order.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.menu.entity.MenuItem;
import com.tableorder.menu.entity.SubCategory;
import com.tableorder.menu.repository.MenuItemRepository;
import com.tableorder.order.dto.OrderCreateRequest;
import com.tableorder.order.dto.OrderResponse;
import com.tableorder.order.entity.Order;
import com.tableorder.order.entity.OrderItem;
import com.tableorder.order.entity.OrderStatus;
import com.tableorder.order.repository.OrderRepository;
import com.tableorder.table.entity.StoreTable;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.repository.TableRepository;
import com.tableorder.table.service.TableSessionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private MenuItemRepository menuItemRepository;
    @Mock
    private TableRepository tableRepository;
    @Mock
    private TableSessionService tableSessionService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Test
    @DisplayName("주문 생성 성공")
    void createOrder_success() {
        Long storeId = 1L;
        StoreTable table = StoreTable.builder().id(1L).storeId(storeId).tableNumber("A1").build();
        TableSession session = TableSession.builder().id(10L).tableId(1L).storeId(storeId).build();
        MenuItem menuItem = MenuItem.builder().id(1L).storeId(storeId).name("아메리카노")
                .price(4500).isAvailable(true).subCategory(SubCategory.builder().build()).build();

        OrderCreateRequest request = new OrderCreateRequest(1L,
                List.of(new OrderCreateRequest.OrderItemRequest(1L, 2)));

        given(tableRepository.findById(1L)).willReturn(Optional.of(table));
        given(tableSessionService.getOrCreateSession(1L, storeId)).willReturn(session);
        given(menuItemRepository.findByIdAndStoreId(1L, storeId)).willReturn(Optional.of(menuItem));
        given(orderRepository.save(any(Order.class))).willAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(100L);
            o.setCreatedAt(LocalDateTime.now());
            return o;
        });

        OrderResponse result = orderService.createOrder(storeId, request);

        assertThat(result.getTableId()).isEqualTo(1L);
        assertThat(result.getTotalAmount()).isEqualTo(9000);
        assertThat(result.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getItems().get(0).getMenuName()).isEqualTo("아메리카노");
    }

    @Test
    @DisplayName("주문 상태 변경 성공 - PENDING → ACCEPTED")
    void updateOrderStatus_success() {
        Long storeId = 1L;
        Order order = Order.builder().id(100L).storeId(storeId).tableId(1L).sessionId(10L)
                .orderNumber("20260430-120000-ABCD").status(OrderStatus.PENDING)
                .totalAmount(9000).createdAt(LocalDateTime.now()).build();
        order.addOrderItem(OrderItem.builder().menuItemId(1L).menuName("아메리카노")
                .quantity(2).unitPrice(4500).subtotal(9000).build());

        StoreTable table = StoreTable.builder().id(1L).storeId(storeId).tableNumber("A1").build();

        given(orderRepository.findByIdAndStoreIdWithItems(100L, storeId)).willReturn(Optional.of(order));
        given(orderRepository.save(any(Order.class))).willReturn(order);
        given(tableRepository.findById(1L)).willReturn(Optional.of(table));

        OrderResponse result = orderService.updateOrderStatus(storeId, 100L, OrderStatus.ACCEPTED);

        assertThat(result.getStatus()).isEqualTo(OrderStatus.ACCEPTED);
    }

    @Test
    @DisplayName("주문 상태 변경 실패 - 잘못된 전이")
    void updateOrderStatus_invalidTransition() {
        Long storeId = 1L;
        Order order = Order.builder().id(100L).storeId(storeId).status(OrderStatus.PENDING).build();

        given(orderRepository.findByIdAndStoreIdWithItems(100L, storeId)).willReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.updateOrderStatus(storeId, 100L, OrderStatus.PREPARING))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("유효하지 않은 상태 변경");
    }

    @Test
    @DisplayName("주문 삭제 성공")
    void deleteOrder_success() {
        Long storeId = 1L;
        Order order = Order.builder().id(100L).storeId(storeId).tableId(1L).build();
        StoreTable table = StoreTable.builder().id(1L).tableNumber("A1").build();

        given(orderRepository.findByIdAndStoreIdWithItems(100L, storeId)).willReturn(Optional.of(order));
        given(tableRepository.findById(1L)).willReturn(Optional.of(table));

        orderService.deleteOrder(storeId, 100L);

        then(orderRepository).should().delete(order);
    }
}
