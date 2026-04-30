package com.tableorder.table.service;

import com.tableorder.common.exception.BusinessException;
import com.tableorder.table.dto.TableCreateRequest;
import com.tableorder.table.dto.TableResponse;
import com.tableorder.table.entity.StoreTable;
import com.tableorder.table.repository.TableRepository;
import com.tableorder.table.repository.TableSessionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class TableServiceTest {

    @InjectMocks
    private TableService tableService;

    @Mock
    private TableRepository tableRepository;

    @Mock
    private TableSessionRepository tableSessionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("테이블 목록 조회 성공")
    void getTables_success() {
        Long storeId = 1L;
        StoreTable table = StoreTable.builder()
                .id(1L).storeId(storeId).tableNumber("A1")
                .isActive(true).createdAt(LocalDateTime.now()).build();

        given(tableRepository.findByStoreIdOrderByTableNumber(storeId)).willReturn(List.of(table));
        given(tableSessionRepository.findByTableIdAndIsActiveTrue(1L)).willReturn(Optional.empty());

        List<TableResponse> result = tableService.getTables(storeId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTableNumber()).isEqualTo("A1");
        assertThat(result.get(0).getCurrentSession()).isNull();
    }

    @Test
    @DisplayName("테이블 등록 성공")
    void createTable_success() {
        Long storeId = 1L;
        TableCreateRequest request = new TableCreateRequest("A1", "password123");

        given(tableRepository.existsByStoreIdAndTableNumber(storeId, "A1")).willReturn(false);
        given(passwordEncoder.encode("password123")).willReturn("encoded");
        given(tableRepository.save(any(StoreTable.class))).willAnswer(invocation -> {
            StoreTable t = invocation.getArgument(0);
            t.setId(1L);
            t.setCreatedAt(LocalDateTime.now());
            return t;
        });
        given(tableSessionRepository.findByTableIdAndIsActiveTrue(1L)).willReturn(Optional.empty());

        TableResponse result = tableService.createTable(storeId, request);

        assertThat(result.getTableNumber()).isEqualTo("A1");
        assertThat(result.getIsActive()).isTrue();
    }

    @Test
    @DisplayName("테이블 등록 실패 - 중복 테이블 번호")
    void createTable_duplicateTableNumber() {
        Long storeId = 1L;
        TableCreateRequest request = new TableCreateRequest("A1", "password123");

        given(tableRepository.existsByStoreIdAndTableNumber(storeId, "A1")).willReturn(true);

        assertThatThrownBy(() -> tableService.createTable(storeId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessage("이미 등록된 테이블 번호입니다");
    }
}
