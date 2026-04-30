package com.tableorder.table.repository;

import com.tableorder.table.entity.OrderHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {

    Page<OrderHistory> findByTableIdOrderByOrderedAtDesc(Long tableId, Pageable pageable);

    @Query("SELECT oh FROM OrderHistory oh WHERE oh.tableId = :tableId " +
           "AND oh.orderedAt >= :startDate AND oh.orderedAt < :endDate " +
           "ORDER BY oh.orderedAt DESC")
    Page<OrderHistory> findByTableIdAndDateRange(
            @Param("tableId") Long tableId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}
