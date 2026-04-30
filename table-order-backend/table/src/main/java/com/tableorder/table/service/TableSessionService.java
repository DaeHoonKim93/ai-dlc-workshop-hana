package com.tableorder.table.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.table.dto.OrderHistoryResponse;
import com.tableorder.table.dto.TableCompleteResponse;
import com.tableorder.table.entity.OrderHistory;
import com.tableorder.table.entity.StoreTable;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.repository.OrderHistoryRepository;
import com.tableorder.table.repository.TableRepository;
import com.tableorder.table.repository.TableSessionRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableSessionService {

    private final TableRepository tableRepository;
    private final TableSessionRepository tableSessionRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final ObjectMapper objectMapper;

    public Optional<TableSession> getCurrentSession(Long tableId) {
        return tableSessionRepository.findByTableIdAndIsActiveTrue(tableId);
    }

    @Transactional
    public TableSession getOrCreateSession(Long tableId, Long storeId) {
        return tableSessionRepository.findByTableIdAndIsActiveTrue(tableId)
                .orElseGet(() -> {
                    TableSession session = TableSession.create(tableId, storeId);
                    log.info("New session started: tableId={}, storeId={}", tableId, storeId);
                    return tableSessionRepository.save(session);
                });
    }

    @Transactional
    public TableCompleteResponse completeSession(Long storeId, Long tableId) {
        StoreTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> BusinessException.notFound("테이블을 찾을 수 없습니다"));

        TableSession session = tableSessionRepository.findByTableIdAndIsActiveTrue(tableId)
                .orElseThrow(() -> BusinessException.badRequest("활성 세션이 없습니다"));

        session.close();
        tableSessionRepository.save(session);

        log.info("Session completed: tableId={}, sessionId={}", tableId, session.getId());

        return TableCompleteResponse.builder()
                .tableId(tableId)
                .tableNumber(table.getTableNumber())
                .completedSessionId(session.getId())
                .archivedOrderCount(0)
                .archivedTotalAmount(0)
                .completedAt(session.getEndedAt())
                .build();
    }

    public Page<OrderHistoryResponse> getTableHistory(Long tableId, LocalDate startDate,
                                                       LocalDate endDate, Pageable pageable) {
        Page<OrderHistory> historyPage;

        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(LocalTime.MAX);
            historyPage = orderHistoryRepository.findByTableIdAndDateRange(tableId, start, end, pageable);
        } else {
            historyPage = orderHistoryRepository.findByTableIdOrderByOrderedAtDesc(tableId, pageable);
        }

        return historyPage.map(this::toOrderHistoryResponse);
    }

    private OrderHistoryResponse toOrderHistoryResponse(OrderHistory history) {
        List<OrderHistoryResponse.OrderHistoryItemResponse> items = parseOrderItems(history.getOrderItems());

        return OrderHistoryResponse.builder()
                .id(history.getId())
                .orderNumber(history.getOrderNumber())
                .totalAmount(history.getTotalAmount())
                .status(history.getStatus())
                .orderItems(items)
                .orderedAt(history.getOrderedAt())
                .completedAt(history.getCompletedAt())
                .build();
    }

    private List<OrderHistoryResponse.OrderHistoryItemResponse> parseOrderItems(String json) {
        try {
            return objectMapper.readValue(json,
                    new TypeReference<List<OrderHistoryResponse.OrderHistoryItemResponse>>() {});
        } catch (Exception e) {
            log.error("Failed to parse order items JSON", e);
            return Collections.emptyList();
        }
    }
}
