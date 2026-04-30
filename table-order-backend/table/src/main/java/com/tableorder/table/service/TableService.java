package com.tableorder.table.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.table.dto.TableCreateRequest;
import com.tableorder.table.dto.TableResponse;
import com.tableorder.table.entity.StoreTable;
import com.tableorder.table.entity.TableSession;
import com.tableorder.table.repository.TableRepository;
import com.tableorder.table.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TableService {

    private final TableRepository tableRepository;
    private final TableSessionRepository tableSessionRepository;
    private final PasswordEncoder passwordEncoder;

    public List<TableResponse> getTables(Long storeId) {
        List<StoreTable> tables = tableRepository.findByStoreIdOrderByTableNumber(storeId);
        return tables.stream()
                .map(this::toTableResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TableResponse createTable(Long storeId, TableCreateRequest request) {
        if (tableRepository.existsByStoreIdAndTableNumber(storeId, request.getTableNumber())) {
            throw BusinessException.conflict("이미 등록된 테이블 번호입니다");
        }

        StoreTable table = StoreTable.builder()
                .storeId(storeId)
                .tableNumber(request.getTableNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .isActive(true)
                .build();

        StoreTable saved = tableRepository.save(table);
        log.info("Table created: storeId={}, tableNumber={}", storeId, request.getTableNumber());

        return toTableResponse(saved);
    }

    public StoreTable getTableById(Long tableId) {
        return tableRepository.findById(tableId)
                .orElseThrow(() -> BusinessException.notFound("테이블을 찾을 수 없습니다"));
    }

    private TableResponse toTableResponse(StoreTable table) {
        TableResponse.SessionInfo sessionInfo = tableSessionRepository
                .findByTableIdAndIsActiveTrue(table.getId())
                .map(this::toSessionInfo)
                .orElse(null);

        return TableResponse.builder()
                .id(table.getId())
                .tableNumber(table.getTableNumber())
                .isActive(table.getIsActive())
                .currentSession(sessionInfo)
                .createdAt(table.getCreatedAt())
                .build();
    }

    private TableResponse.SessionInfo toSessionInfo(TableSession session) {
        return TableResponse.SessionInfo.builder()
                .sessionId(session.getId())
                .startedAt(session.getStartedAt())
                .totalOrderAmount(0)
                .orderCount(0)
                .build();
    }
}
