package com.tableorder.unit1.bridge;

import com.tableorder.auth.service.TableAuthBridge;
import com.tableorder.auth.service.TableAuthInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Unit1 전용 TableAuthBridge 구현체.
 * store_table 테이블에서 직접 조회합니다.
 * Unit2의 table 모듈에 의존하지 않고 JDBC로 직접 접근합니다.
 */
@Component
@RequiredArgsConstructor
public class TableAuthBridgeImpl implements TableAuthBridge {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public Optional<TableAuthInfo> findTable(Long storeId, String tableNumber) {
        String sql = "SELECT id, store_id, table_number, password FROM store_table " +
                     "WHERE store_id = ? AND table_number = ? AND is_active = true";

        return jdbcTemplate.query(sql, (rs, rowNum) -> TableAuthInfo.builder()
                        .id(rs.getLong("id"))
                        .storeId(rs.getLong("store_id"))
                        .tableNumber(rs.getString("table_number"))
                        .password(rs.getString("password"))
                        .build(),
                storeId, tableNumber)
                .stream()
                .findFirst();
    }
}
