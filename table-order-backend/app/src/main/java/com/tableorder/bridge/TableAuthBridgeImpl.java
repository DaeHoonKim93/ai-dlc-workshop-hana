package com.tableorder.bridge;

import com.tableorder.auth.service.TableAuthBridge;
import com.tableorder.auth.service.TableAuthInfo;
import com.tableorder.table.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TableAuthBridgeImpl implements TableAuthBridge {

    private final TableRepository tableRepository;

    @Override
    public Optional<TableAuthInfo> findTable(Long storeId, String tableNumber) {
        return tableRepository.findByStoreIdAndTableNumber(storeId, tableNumber)
                .filter(t -> t.getIsActive())
                .map(t -> TableAuthInfo.builder()
                        .id(t.getId())
                        .storeId(t.getStoreId())
                        .tableNumber(t.getTableNumber())
                        .password(t.getPassword())
                        .build());
    }
}
