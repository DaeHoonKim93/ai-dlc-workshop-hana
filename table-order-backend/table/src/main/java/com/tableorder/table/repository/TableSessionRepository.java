package com.tableorder.table.repository;

import com.tableorder.table.entity.TableSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TableSessionRepository extends JpaRepository<TableSession, Long> {

    Optional<TableSession> findByTableIdAndIsActiveTrue(Long tableId);

    boolean existsByTableIdAndIsActiveTrue(Long tableId);
}
