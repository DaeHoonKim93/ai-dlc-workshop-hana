package com.tableorder.table.repository;

import com.tableorder.table.entity.StoreTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<StoreTable, Long> {

    List<StoreTable> findByStoreIdOrderByTableNumber(Long storeId);

    Optional<StoreTable> findByStoreIdAndTableNumber(Long storeId, String tableNumber);

    boolean existsByStoreIdAndTableNumber(Long storeId, String tableNumber);
}
