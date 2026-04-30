package com.tableorder.order.repository;

import com.tableorder.order.entity.Order;
import com.tableorder.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.id = :orderId AND o.storeId = :storeId")
    Optional<Order> findByIdAndStoreIdWithItems(@Param("orderId") Long orderId, @Param("storeId") Long storeId);

    Page<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId, Pageable pageable);

    Page<Order> findByStoreIdAndStatusOrderByCreatedAtDesc(Long storeId, OrderStatus status, Pageable pageable);

    List<Order> findByTableIdAndSessionIdOrderByCreatedAtDesc(Long tableId, Long sessionId);

    List<Order> findBySessionId(Long sessionId);

    @Query("SELECT o.tableId, SUM(o.totalAmount), COUNT(o) FROM Order o " +
           "WHERE o.storeId = :storeId AND o.sessionId IN " +
           "(SELECT ts.id FROM com.tableorder.table.entity.TableSession ts WHERE ts.isActive = true) " +
           "GROUP BY o.tableId")
    List<Object[]> findDashboardAggregates(@Param("storeId") Long storeId);

    void deleteBySessionId(Long sessionId);
}
